# GUI / BLADE

Client/gui for Digital Twin.

> For information reagrding the original Panopticon AI code, please review the [client project structure](https://github.com/Panopticon-AI-team/panopticon/blob/main/CONTRIBUTING.md#client) to get familiar with the folder and file organization and their intended context.

---

## Table of Contents

- [Installation](#installation)
  - [Clone Repository](#clone-repository)
  - [Quick Start without Server](#quick-start)
  - [Start Development Server](#start-development-server)

---

## [Installation](#installation)

Assuming the reader has not cloned nor started with the Quick Start guide at the [initial README.md](./README.md). If not, please navigate to [npm-installation](#npm-installation).

### [Clone Repository](#clone-repository)

```bash
git clone git@git@github.com:rfoo1250/digital-twin-proto.git
```

```bash
cd <project-name>/client
```

### [NPM Installation](#npm-installation)

```bash
npm install
```

### [ArmyGPT Model Setup](#armygpt-model-setup)

To utilize the in-built ArmyGPT assistant, create `client/.env` and configure a chat-completion provider.

Default behavior:

- Provider: `openrouter`
- Profile: `quality`
- Default model stack: `google/gemini-2.5-pro` -> `anthropic/claude-sonnet-4` -> `google/gemini-2.5-flash`

Recommended OpenRouter setup:

```bash
LLM_PROVIDER=openrouter
LLM_MODEL_PROFILE=quality
LLM_API_KEY=<your-openrouter-api-key>
```

Recommended Hugging Face open-source setup:

```bash
LLM_PROVIDER=huggingface
LLM_MODEL_PROFILE=oss
HF_TOKEN=<your-hugging-face-token>
```

Recommended Mistral setup:

```bash
LLM_PROVIDER=mistral
LLM_MODEL=mistral-small-latest
LLM_API_KEY=<your-mistral-api-key>
```

Useful overrides:

- `LLM_MODEL_PROFILE=quality|balanced|fast|oss`
- `LLM_MODEL=<provider-specific-model-id>`
- `LLM_FALLBACK_MODELS=model-a,model-b`
- `LLM_BASE_URL=<custom OpenAI-compatible endpoint>`
- `LLM_API_KEY=<generic provider token>`

The runtime also accepts `OPENROUTER_API_KEY` for OpenRouter, `HF_TOKEN` for Hugging Face, and `MISTRAL_API_KEY` for Mistral. If you set `LLM_MODEL` or `LLM_BASE_URL`, they override the preset defaults. If you are switching from OpenRouter to Mistral, replace OpenRouter-style model IDs such as `qwen/qwen-plus` with native Mistral IDs such as `mistral-small-latest`.

For focus-fire recommendation upgrades, export the focus-fire telemetry JSONL from the toolbar and train an offline tree ranker with `gym/scripts/focus_fire/train_tree_ranker.py`, then import the generated model JSON back into the client. The current `gym` environment is set up to use `LightGBM LambdaMART` automatically when available, so no manual model download is required.

### [Quick Start without Server](#quick-start)

To run the client without a server:

```bash
npm run standalone
```

### [Start Development Server](#start-development-server)

```bash
npm run start
```
