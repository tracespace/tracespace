# tracespace pcb stackup builder

NAME := tracespace-pcb-stackup
SRC_DIR := src
LIB_DIR := lib
TEST_DIR := test

SRC := $(shell find $(SRC_DIR) -name '*.coffee')
LIB := $(patsubst $(SRC_DIR)/%.coffee, $(LIB_DIR)/%.js, $(SRC))
TEST := $(shell find $(TEST_DIR) -name '*_test.coffee')

all: $(LIB)

lint:
	coffeelint $(SRC) $(TEST_DIR)/*.coffee

test:
	mocha -R spec --recursive --compilers coffee:coffee-script/register \
    --require coffee-coverage/register-istanbul $(TEST) \
	&& istanbul report text-summary lcov

test-browsers:
	zuul --concurrency 4 $(TEST)

test-phantom:
	zuul --phantom $(TEST)

test-watch:
	chokidar $(SRC) $(TEST) -c 'make test'

watch:
	chokidar $(SRC) -c "make"

clean:
	rm -rf $(LIB_DIR)

# todo: fix up mkdir to be more general
$(LIB_DIR)/%.js: $(SRC_DIR)/%.coffee
	mkdir -p `dirname $@`
	coffee -c -o `dirname $@` -- $<

.PHONY: lint
.PHONY: lib
.PHONY: test test-visual test-browsers test-phantom test-watch
.PHONY: watch
.PHONY: clean
