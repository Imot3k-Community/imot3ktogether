const Discord = require("discord.js"),
fetch = require("node-fetch"),
client = new Discord.Client(),
token = require('./config.json').token;

var guildId = ''

client.on("message", async message => {
    guildId = message.guild.id
});

const getApp = (guildId) => {
    const app = client.api.applications(client.user.id)
    if (guildId) {
        app.guilds(guildId)
    }
    return app
}
 
client.on('ready', async () => {
    console.log('The bot is ready')
    const commands = await getApp(guildId).commands.get()
 
    client.ws.on('INTERACTION_CREATE', async (interaction) => {
    const { name, options } = interaction.data
    const command = name.toLowerCase()
    const args = {}
 
        if (options) {
            for (const option of options) {
            const { name, value } = option
            args[name] = value
            }
        }
 
    if (command === 'start') {
        for (const arg in args) {
        const channel = client.channels.cache.get(args[arg]);
            fetch(`https://discord.com/api/v8/channels/${channel.id}/invites`, {
            method: "POST",
            body: JSON.stringify({
                max_age: 86400,
                max_uses: 0,
                target_application_id: "755600276941176913",
                target_type: 2,
                temporary: false,
                validate: null
            }),
            headers: {
                "Authorization": `Bot ${client.token}`,
                "Content-Type": "application/json"
            }
        })
            .then(res => res.json())
            .then(invite => {
                if (invite.error || !invite.code) return reply(interaction, "❌ | Impossible de démarrer **YouTube Together** !");
                reply(interaction, `✅ | Cliquez ici pour commencer **YouTube Together**. dans <#${channel.id}>: <https://discord.gg/${invite.code}>`);
            })
            .catch(e => {
                reply(interaction, "❌ | Impossible de démarrer **YouTube Together** !");
            })
        }
        }
    })
})
 
const reply = async (interaction, response) => {
    let data = {
        content: response,
    }

    if (typeof response === 'object') {
        data = await createAPIMessage(interaction, response)
    }
 
    client.api.interactions(interaction.id, interaction.token).callback.post({
        data: {
            type: 4,
            data,
        },
    })
    }
 
const createAPIMessage = async (interaction, content) => {
    const { data, files } = await DiscordJS.APIMessage.create(
        client.channels.resolve(interaction.channel_id),
        content
    )
        .resolveData()
        .resolveFiles()
    return { ...data, files }
    }

client.login(token);