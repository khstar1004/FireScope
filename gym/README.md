# Prerequisites
1. Python 3.12.3
2. pip

# Quick Start Guide
## Get VISTA
1. Click on "Clone or download", and then "Download Zip". 
2. Unzip the repo anywhere.
3. Navigate to the folder than contains `setup.py` and install the repository using `pip install .` Anytime you make changes to the files in the project folder, you need to reinstall the package using `pip install .`. Alternatively, use `pip install -e .` to install the package in editable mode. After doing this you can change the code without needing to continue to install it. 
4. [gymnasium](https://gymnasium.farama.org/) is a dependency for users who want to use VISTA as a Gym environment. In this case, use `pip install .[gym]` or `pip install -e .[gym]` for setup.

## Run a demo
1. Run the provided demo in `scripts/simple_demo/demo.py`.
2. The demo will output a scenario file that can be viewed using the frontend GUI.

## RL Settings
See [`docs/rl_settings.md`](docs/rl_settings.md) for a concise summary of the current RL environment, action/observation space, defaults, and training entrypoints.

## Focus-Fire Tree Ranker
VISTA can also import a portable tree-based focus-fire ranker trained from recommendation telemetry.

1. In the client, export `집중포격 > JSONL`.
2. Train a tree ranker:
   `python scripts/focus_fire/train_tree_ranker.py --input <telemetry.jsonl> --output <focus_fire_tree_ranker.json>`
3. In the client, use `집중포격 > 모델 불러오기` and load the generated JSON.

The script runs in `auto` mode by default and prefers `LightGBM LambdaMART` when `lightgbm` is installed. If LightGBM is unavailable, it falls back to the built-in portable stump trainer.

To make a fresh environment reproducible:
- `pip install -e .[ranker]`

The script produces a `tree-ensemble` reranker model that the frontend can execute locally without a server dependency, so no manual model download is required.
