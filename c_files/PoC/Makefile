HEADERS_PATH = includes/
HEADERS = $(HEADERS_PATH)*
SRC_PATH = src/
SRC = $(SRC_PATH)*
TEST_PATH = TEST/
TEST1 = $(TEST_PATH)/test1.txt
TEST2 = $(TEST_PATH)/test2.txt
BUILD = build/
FLAGS = -Wall -ansi -pedantic
OBJECT = conv

init:
	mkdir $(HEADERS_PATH)
	mkdir $(SRC_PATH)
	mkdir $(TEST_PATH)
	mkdir $(BUILD)

$(OBJECT):
	gcc conv.c tcp_exep.c -o ./build/conv -lpcap -ljson-c
#	gcc $(SRC) -I $(HEADERS) -o $(BUILD)$(OBJECT) 
#	gcc $(SRC) -I $(HEADERS) -o $(OBJECT) $(FLAGS)

# clear: $(SRC) $(HEADERS)
# 	rm $(OBJECT)
