import { WorldScene } from "../scenes/main-scene";
import { DecorativeAgent, DecorativeAgentConfig } from "./decorative_agent";
import { say } from "../agents/commands/dialog";
import { teleport } from "../agents/commands/teleport";

type SayCommand = {
  command: "say";
  msg: string | string[];
};

type TeleportCommand = {
  command: "teleport";
  map: string;
  x: integer;
  y: integer;
};
type AgentCommand = SayCommand | TeleportCommand;

type AgentState = {
  // TODO it's not a string, yet to decide
  conditions?: string[];
  aspect?: DecorativeAgentConfig;
  on_touch?: AgentCommand[];
  on_init?: AgentCommand[];
};
type AgentConfig = { states: AgentState[] };

export class FullAgent {
  private agentId: string;
  private config: AgentConfig;
  private aspect?: DecorativeAgent;
  private basePath: string;
  private scene: WorldScene;

  constructor(agentPath: string, agentId: string, agentConfig: any) {
    this.agentId = agentId;
    this.config = agentConfig;
    this.basePath = agentPath.slice(0, agentPath.lastIndexOf("/") + 1);
  }

  async load(targetScene: WorldScene, x: integer, y: integer) {
    console.log("Loading agent: ", this.agentId);
    this.scene = targetScene;
    // determine the state to use, is the first that has no unmet conditions
    // TODO implement this, for now set it to 0
    await this.activateState(0, targetScene, x, y);

    return { shouldUpdate: true };
  }

  private async activateState(
    idx: integer,
    targetScene: WorldScene,
    x: integer,
    y: integer
  ) {
    // TODO check whether the aspect is the same as before
    // load the aspect corresponding to the state, if any
    if (this.config.states[idx].aspect) {
      console.log(
        "Spritesheet for full agent, base path: ",
        this.basePath,
        " relative path: ",
        this.config.states[idx].aspect.spritesheet
      );
      this.aspect = new DecorativeAgent();
      let spriteSheetPath: string;
      if (this.config.states[idx].aspect.spritesheet.startsWith("/")) {
        spriteSheetPath = this.config.states[idx].aspect.spritesheet;
      } else {
        spriteSheetPath =
          this.basePath + this.config.states[idx].aspect.spritesheet;
      }
      await this.aspect.load(targetScene, {
        ...this.config.states[idx].aspect,
        spritesheet: spriteSheetPath,
        x,
        y,
      });
      // execute on_init, if present
      if (this.config.states[idx].on_init) {
        await this.run(this.config.states[idx].on_init, null);
      }
    }
    if (this.config.states[idx].on_touch) {
      if (!this.config.states[idx].aspect) {
        throw new Error("Cannot collide if no aspect is defined!");
      }
      this.aspect.onCollide(async (other) => {
        //note: this is not awaited
        this.run(this.config.states[idx].on_touch, other);
      });
    }
  }
  update(time: number, delta: number) {
    this.aspect?.update(time, delta);
  }
  destroy(): void {
    this.aspect?.destroy();
  }
  private async run(commands: AgentCommand[], other: any) {
    // TODO implement this
    for (let idx = 0; idx < commands.length; idx++) {
      const cmd = commands[idx];
      if (cmd.command == "say") {
        await say(this.scene, cmd.msg);
        continue;
      }
      if (cmd.command == "teleport") {
        await teleport(this.scene, cmd.map, cmd.x, cmd.y);
        continue;
      }
      throw new Error("Unknown command " + cmd);
    }
  }
}
