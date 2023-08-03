import chalk from "chalk";
import { 
  App, 
  LogLevel 
} from "@slack/bolt";
import Bot from './bot';
import { error } from "../util";

// Initialize the Bolt app with the token and signing secret

// Listens to incoming messages that contain "hello"
// app.message("hello", async ({ message, say }) => {
//   console.log(message);
//   await say(`Hey there!`);
// });
class SlackBot extends Bot {
  app: App;
  constructor() {
    super();

    this.app = new App({
      socketMode: true, // Enable the socket mode
      token: process.env.SLACK_BOT_TOKEN,
      appToken: process.env.SLACK_APP_TOKEN,
      logLevel: process.env.DEBUG ==='debug' ? LogLevel.DEBUG : LogLevel.INFO,
    });
  }

  async say() { }

  handleHello = async ({ message, say }: { message: any, say: any }) => {
    console.log(message);
    await say(`Hey there!`);
  }

  handleAppMention = async ({ event, client }: { event: any, client: any }) => {
    const inputs = {};
    const query = event.text;
    const user = event.user || '';

    // Send an initial message and open a thread
    const response = await client.chat.postMessage({
      channel: event.channel,
      thread_ts: event.ts,
      text: `<@${user}>! ...`,
    });

    if (response.channel && response.ts) {
      this.send(
        inputs,
        query,
        user,
        async (msg) => {
          await client.chat.update({
            channel:  response.channel,
            ts:  response.ts,
            text: msg,
          });
        }
      )

    } else {
      error('Error while sending message');
    }
  }

  async hear() {
    this.app.message("hello", this.handleHello);
    this.app.event("app_mention", this.handleAppMention);
  }

  async up() {
    await this.app.start();
    console.log(chalk.blue("⚡️ Slack app started"));
  }
}

export default SlackBot;
