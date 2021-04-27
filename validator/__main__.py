import json
from functools import lru_cache
import logging
from pathlib import Path
import re
from typing import Iterator

import jsonschema


@lru_cache
def get_schema(name: str) -> dict:
    with open(Path("schemas") / (name + ".json")) as fr:
        return json.load(fr)


def validate_with_schema(data: dict, schema_name: str):
    schema = get_schema(schema_name)
    jsonschema.validate(data, schema)


def read_json(p: Path) -> dict:
    with open(p) as fr:
        return json.load(fr)


def chunks_iterator(world_path: Path, pattern: str) -> Iterator[Path]:
    """Given a world file path and a pattern, enumerates the found chunks.

    This is based on the actual files present on the filesystem.
    """
    parts = re.split("[\(\)]", pattern)
    parts = [p.replace("\\.", ".") for p in parts]
    if len(parts) != 5:
        raise ValueError(
            f"Cannot parse map chunk pattern {pattern} in world {world_path}"
        )
    chunks_directory = (world_path.parents[0] / parts[0]).parents[0]
    solved_pattern = "".join(
        [str((world_path.parents[0] / parts[0])), "-?\\d+", parts[2], "-?\\d+", parts[4]]
    )
    for child in chunks_directory.iterdir():
        if re.match(solved_pattern, str(child)) is not None:
            yield child


def check_world(p: Path):
    logging.info(f"Checking world file {p}")
    data = read_json(p)
    validate_with_schema(data, "tiled_world")
    # TODO currently it assumes there's only a pattern
    # is there any use for that?
    if len(data["patterns"]) != 1:
        raise ValueError("World {p} has not exactly 1 pattern defined")
    for c in chunks_iterator(p, data["patterns"][0]["regexp"]):
        check_chunk(c)


def check_agent(p: Path, agent_rel_path: str):
    agent_path = p.parents[0] / agent_rel_path
    logging.info(f'Checking agent {agent_path}')
    data = read_json(agent_path)
    validate_with_schema(data, "full_agent")


def check_chunk(p: Path):
    logging.info(f'Checking map chunk {p}')
    # TODO check the tileset first, keep it for later comparison with tiles id
    data = read_json(p)
    validate_with_schema(data, "tiled_map")
    for layer in data['layers']:
        if layer["type"] == "tilelayer":
            # TODO check the content, for example the size
            continue
        if layer["type"] == "objectgroup":
            for obj in layer['objects']:
                agent_path = obj['properties'].get('agent')
                if agent_path is not None:
                    check_agent(p, agent_path)


def main(game_folder: Path):
    logging.basicConfig(
        level=logging.DEBUG, format="%(asctime)s %(levelname)s %(message)s"
    )
    game_root = read_json(game_folder / "game.json")
    validate_with_schema(game_root, "game")
    # TODO check playerSpritesheet exists and is an image with meaningful size...
    world_file = game_root["initialWorld"]
    check_world(Path(world_file))


if __name__ == "__main__":
    main(Path("game"))
