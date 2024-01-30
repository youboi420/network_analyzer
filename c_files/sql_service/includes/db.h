/* usint mysqlclient-dev || -lmysqlclient */
#include <mysql/mysql.h>

/* consts for connections and queries */
#define DB ""
#define TABLE DB".test_table" /* for database.table syntax */
// "localhost", "user", "user"
#define HOST "localhost"
#define USER "user"
#define PASSWORD "user"