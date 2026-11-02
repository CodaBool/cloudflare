// import {  } from 'discord-interactions'

export default {
  ADD_TO_ALLOWLIST_COMMAND: {
    // 'name' must not contain spaces
    name: 'minecraft_allowlist',
    description: 'add a minecraft username to the allowlist',
    options: [{
      name: "username",
      type: 3, // STRING
      description: "add a minecraft username to the allowlist",
      required: true,
    }],
  },
}
