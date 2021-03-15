type AgentCommand = {
  command: "say" | "teleport";
};
type AgentState = {
  conditions?: string[];
  on_touch?: AgentCommand[];
};
type AgentConfig = { states: AgentState[] };

export class FullAgent {
  private agentId: string;
  private config: AgentConfig;
  constructor(agentId: string, agentConfig: any) {
    this.agentId = agentId;
    this.config = agentConfig;
  }

  async load() {
    console.log("Loading agent: ", this.agentId);
    return { shouldUpdate: true };
  }
  update(time: number, delta: number) {
    //implement this
  }
}
