import { data as allData } from "./data.js"

const ROOM_CHAR_SIZE = 6
// games expire 45m after creation
const GAME_TTL = 45 * 60 * 1000
const RACE_SECONDS = 120

// every game lives in memory and is sent to clients whole on each update
const games = new Map()
// the countdown or race clock interval of each game, kept off the game object so it never reaches the client
const clocks = new Map()

function objectId() {
  return [...crypto.getRandomValues(new Uint8Array(12))].map(b => b.toString(16).padStart(2, "0")).join("")
}

function newPlayer(name, isLeader, cid, room, sid) {
  return {
    _id: objectId(),
    name,
    isLeader,
    room,
    cid,
    sid,
    wpm: -1,
    givenUp: false,
    isReady: false,
    isWinner: false,
    percent: 0,
    wins: 0,
  }
}

function newGame(_id) {
  return {
    _id,
    ...randomExcerpt(),
    isOpen: true,
    isOver: false,
    isStarted: false,
    isTypable: false,
    players: [],
    createdAt: new Date().toISOString(),
  }
}

function randomExcerpt() {
  const excerpt = allData[Math.floor(Math.random() * allData.length)]
  return {
    quote: excerpt.quote,
    source: excerpt.source,
    speed: excerpt.speed,
    words: excerpt.quote.split(' ').length,
  }
}

function isExpired(game) {
  return Date.now() - Date.parse(game.createdAt) > GAME_TTL
}

function findGame(gid) {
  const game = games.get(gid)
  if (game && isExpired(game)) {
    deleteGame(gid)
    return null
  }
  return game ?? null
}

function deleteGame(gid) {
  games.delete(gid)
  stopClock(gid)
}

function stopClock(gid) {
  clearInterval(clocks.get(gid))
  clocks.delete(gid)
}

export function setup(io) {
  const players = new Map()

  // every way a race can end goes through here, so every player gets the same "done"
  function finishRace(game) {
    const winnerID = getWinner(game)
    for (const player of game.players) {
      if (player.cid === winnerID && !player.isWinner) {
        player.isWinner = true
        player.wins++
      }
    }
    console.log('race over', game._id, 'winner', winnerID)
    resetPlayers(game)
    io.to(game._id).emit('done', { winnerID, game })
  }

  io.on('connection', socket => {
    const id = socket.id
    let room = id.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, ROOM_CHAR_SIZE)

    socket.on('progress', ({ percent, gid }) => {
      const game = findGame(gid)
      if (!game?.isStarted) return
      const player = game.players.find(player => player.sid === id)
      if (!player) return

      console.log('got from', player.name, 'progress to', percent)

      if (percent < 100) { // unfinished and verify that there was a change
        if (player.percent !== percent) {
          player.percent = percent
          io.to(gid).emit('updateGame', game)
        }
      } else {
        // calculate Words Per Minute
        player.wpm = calculateWPM(game.startTime, player, game.words, true)
        player.percent = 100

        // if no one is winner set winner
        if (!game.players.some(player => player.isWinner)) {
          player.wins++
          player.isWinner = true
        }

        if (allDone(game)) finishRace(game)
        io.to(gid).emit('updateGame', game)
      }
    })

    socket.on('give-up', ({ gid }) => {
      const game = findGame(gid)
      const player = game?.players.find(player => player.sid === id)
      if (!player) return
      console.log(player.name, 'gave up')
      player.givenUp = true
      if (allDone(game)) return finishRace(game)
      io.to(gid).emit('updateGame', game)
    })

    socket.on('timer', ({ gid }) => {
      // time in seconds
      let countDown = 5
      const game = findGame(gid)
      if (!game) return
      // check if player has permission to start game
      const player = players.get(id)
      const allReady = game.players.every(player => player.isReady)
      if (!player?.isLeader || !allReady) return

      // move from lobby to game, reset player stats
      for (const player of game.players) {
        player.wpm = -1
        player.percent = 0
        player.givenUp = false
        player.isWinner = false
      }
      Object.assign(game, randomExcerpt())
      game.isTypable = false
      game.isStarted = true
      io.to(gid).emit('updateGame', game)

      // a second "timer" restarts the countdown instead of running two
      stopClock(gid)

      // start time countdown
      clocks.set(gid, setInterval(() => {
        // keep counting down until we hit 0
        if (countDown >= 0) {
          io.to(gid).emit('timer', { countDown, msg: "Starting Game" })
          countDown--
        } else {
          // start time clock over, now time to start game
          io.to(gid).emit('start-race')
          // close game so no one else can join
          game.isOpen = false
          game.isTypable = true
          io.to(gid).emit('updateGame', game)
          startGameClock(game)
        }
      }, 1000))
    })

    socket.on('join-game', ({ gid, name, cid }) => {
      try {
        const game = findGame(gid)
        if (!game) {
          throw `No game found by ID ${gid}`
        }
        // check if game is allowing users to join
        if (!game.isOpen) {
          throw 'Game Closed'
        }
        // check if player is already in game
        if (game.players.find(player => player.name === name)) {
          throw 'A player with that name already exists. Please change your name and try again or create a new game.'
        }

        // make players socket join the game room
        socket.join(gid)
        console.log(name, 'is leaving previous room of', room, 'to join', gid)
        socket.leave(room)
        room = gid
        const player = newPlayer(name, false, cid, room, id)
        players.set(id, player)
        game.players.push(player)

        console.log('emitting to updateGame new player', name, gid)
        io.to(gid).emit('updateGame', game)
      } catch (err) {
        console.log(err)
        socket.emit('error', typeof err === 'string' ? err : err.message || err)
      }
    })

    socket.on('change-ready', ({ gid, cid, isReady }) => {
      const game = findGame(gid)
      if (!game) return
      for (const player of game.players) {
        if (player.cid === cid && player.isReady !== isReady) {
          player.isReady = isReady
          io.to(gid).emit('updateGame', game)
        }
      }
    })

    socket.on('change-open', ({ gid, isOpen }) => {
      const game = findGame(gid)
      if (game && game.isOpen !== isOpen) {
        game.isOpen = isOpen
        io.to(gid).emit('updateGame', game)
      }
    })

    socket.on('send-message', body => {
      io.to(room).emit('get-message', body)
    })

    socket.on('create-game', ({ name, cid }) => {
      for (const [gid, game] of games) {
        if (isExpired(game)) deleteGame(gid)
      }
      // refuse a duplicate id, so a player sitting in someone else's game can't overwrite it
      if (games.has(room)) {
        console.log('game already exists for room', room)
        return
      }
      const game = newGame(room)
      const player = newPlayer(name, true, cid, room, id)
      players.set(id, player)
      game.players = [player]
      games.set(room, game)

      // make players socket join the game room
      socket.join(room)
      console.log("sending update to room", room)
      io.to(room).emit('updateGame', game)
    })

    socket.on('disconnect', () => {
      players.delete(id)
      const game = findGame(room)
      if (!game) return
      game.players = game.players.filter(player => player.sid !== id)
      if (!game.players.length) {
        console.log('last player left, deleting game', room)
        return deleteGame(room)
      }
      // hand the lead on, otherwise nobody left can start a race
      if (!game.players.some(player => player.isLeader)) game.players[0].isLeader = true
      if (game.isStarted && allDone(game)) finishRace(game)
      io.to(room).emit('updateGame', game)
    })
  })

  function startGameClock(game) {
    const gameID = game._id
    game.startTime = Date.now()
    // time is in seconds
    let time = RACE_SECONDS
    stopClock(gameID)
    clocks.set(gameID, setInterval(() => {
      // keep countdown going
      if (time >= 0) {
        io.to(gameID).emit('timer', { countDown: calculateTime(time), msg: "Time Remaining" })
        time--
        return
      }
      // game clock has run out, game is over
      // calculate all players WPM who haven't finished typing out sentence
      for (const player of game.players) {
        if (player.wpm === -1) {
          player.wpm = calculateWPM(game.startTime, player, game.words)
        }
      }
      finishRace(game)
      io.to(gameID).emit('updateGame', game)
    }, 1000))
  }
}

function allDone(game) {
  return game.players.every(player => player.percent === 100 || player.givenUp)
}

function resetPlayers(game) {
  game.isOpen = true
  game.isTypable = false
  game.isStarted = false
  for (const p of game.players) {
    p.percent = 0
    p.givenUp = false
    p.isReady = false
  }
  stopClock(game._id)
}

function getWinner(game) {
  let highestPercent = 0
  let winnerID = null
  // find declared winner
  for (const player of game.players) {
    if (player.isWinner) {
      winnerID = player.cid
    }
    if (player.percent > highestPercent) {
      highestPercent = player.percent
    }
  }
  // find closest winner if none were declared
  if (!winnerID) {
    for (const player of game.players) {
      if (player.percent >= highestPercent) {
        winnerID = player.cid
      }
    }
  }
  return winnerID
}

function calculateTime(time) {
  const minutes = Math.floor(time / 60)
  const seconds = time % 60
  return `${minutes}:${seconds < 10 ? "0" + seconds : seconds}`
}

function calculateWPM(startTime, player, words, finished) {
  const numOfWords = finished ? words : player.percent / 100 * words
  // use current time as end time
  const timeInMinutes = (Date.now() - startTime) / 1000 / 60
  return Math.floor(numOfWords / timeInMinutes)
}
