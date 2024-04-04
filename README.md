# TypinGym
Not Yet Another Static Touch Typing Gym

learns your error patterns to provide you with intelligent suggestions.

1. provides new word and symbols based on symbol error rates, misstyped and slow characters.
2. allows configurable training sessions on punctuations, surrounds, and symbols.

**this is still a work in progress, so dont expect things to stay the same. and yes, its full of bugs and bad code :)**

**only supports localhost running for now**

**TL;DR**
```bash
# to install npm (frontend) and pip (backend) requirements
make install-dependencies

# to run the servers
make run
```
## Installation

To install the necessary dependencies for both the backend and frontend, follow these steps:

1. **Backend Dependencies:**
    ```bash
    pip install -r backend/requirements.txt
    ```

2. **Frontend Dependencies:**
    ```bash
    npm install --prefix frontend
    ```

**or just run**
```bash
make install-dependencies
```

## Usage

### Running Backend and Frontend

To run both the backend and frontend servers simultaneously, you can use the provided Makefile. Make sure you have Make installed on your system.

```bash
make run
```

other recommended touch typing sites I love:
* [monkeytype](https://monkeytype.com/): many modes, great progression tracking.
* [typing club](https://www.typingclub.com/): if you want to start somewhere, THE best place to learn touch typing.
* [nitrotypy](https://nitrotype.com): just pure fun, don't get addicted.
