export class FullAgent {
  private agentId: string;
  constructor(agentId: string, agentConfig: any) {
    this.agentId = agentId;
  }

  async load() {
    console.log("Loading agent...");
    return { shouldUpdate: true };
  }
  update(time: number, delta: number) {
    //implement this
  }
}
