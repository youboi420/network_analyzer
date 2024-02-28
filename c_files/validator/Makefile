HEADERS_PATH = includes/
HEADERS = $(HEADERS_PATH)*
SRC_PATH = src/
SRC = $(SRC_PATH)*
TEST_PATH = TEST/
BUILD = build/
FLAGS = -Wall -ansi -pedantic
OBJECT = validator
LIBS = -lpcap

$(OBJECT):
	gcc $(SRC) -I $(HEADERS) -g -o $(BUILD)$(OBJECT) $(LIBS)
	cp $(BUILD)$(OBJECT) ../../js/backend/bin/build