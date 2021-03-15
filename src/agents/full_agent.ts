import { WorldScene } from "../scenes/main-scene";
import { DecorativeAgent, DecorativeAgentConfig } from "./decorative_agent";

type AgentCommand = {
  command: "say" | "teleport";
};
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
  private currentStateIdx: integer;
  private aspect?: DecorativeAgent;
  private basePath: string;

  constructor(agentPath: string, agentId: string, agentConfig: any) {
    this.agentId = agentId;
    this.config = agentConfig;
    this.basePath = agentPath.slice(0, agentPath.lastIndexOf("/") + 1);
  }

  async load(targetScene: WorldScene, x: integer, y: integer) {
    console.log("Loading agent: ", this.agentId);
    // determine the state to use, is the first that has no unmet conditions
    // TODO implement this, for now set it to 0
    this.currentStateIdx = 0;
    // now load the aspect corresponding to the state, if any
    if (this.config.states[this.currentStateIdx].aspect) {
      console.log(
        "Spritesheet for full agent, base path: ",
        this.basePath,
        " relative path: ",
        this.config.states[this.currentStateIdx].aspect.spritesheet
      );
      this.aspect = new DecorativeAgent();
      let spriteSheetPath: string;
      if (
        this.config.states[this.currentStateIdx].aspect.spritesheet.startsWith(
          "/"
        )
      ) {
        spriteSheetPath = this.config.states[this.currentStateIdx].aspect
          .spritesheet;
      } else {
        spriteSheetPath =
          this.basePath +
          this.config.states[this.currentStateIdx].aspect.spritesheet;
      }
      await this.aspect.load(targetScene, {
        ...this.config.states[this.currentStateIdx].aspect,
        spritesheet: spriteSheetPath,
        x,
        y,
      });
      // execute on_init, if present
      if (this.config.states[this.currentStateIdx].on_init){
        await this.run(this.config.states[this.currentStateIdx].on_init);
      }
    }
    return { shouldUpdate: true };
  }
  update(time: number, delta: number) {
    this.aspect?.update(time, delta);
  }
  destroy(): void {
    this.aspect?.destroy();
  }
  private async run(commands: AgentCommand[]){
    // TODO implement this
    console.log('Requested execution of commands: ', commands);
  }
}
