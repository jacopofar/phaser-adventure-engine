export class FullAgent {
  constructor(agentId: string, agentConfig: any) {}

  async load() {
    console.log("Loading agent...");
    return { shouldUpdate: true };
  }
  update(time: number, delta: number) {
    //implement this
  }
}
