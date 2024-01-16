#include "../includes/db.h"
#include "../includes/service.h"
int main(int argc, char *argv[])
{
    MYSQL *conn;
    MYSQL_RES *res;
    MYSQL_ROW row;
    info(TABLE);
    conn = mysql_init(NULL);
    if (conn == NULL)
    {
        error("mysql_init() failed");
        return 1;
    }
    if (mysql_real_connect(conn, HOST, USER, PASSWORD, DB, 0, NULL, 0) == NULL)
    {
        error("mysql_real_connect() failed");
        mysql_close(conn);
        return 1;
    }
    if (mysql_query(conn, "SELECT * FROM test_db.test_table")) {
        error("SELECT * FROM " TABLE " failed");
        mysql_close(conn);
        return 1;
    }
    res = mysql_store_result(conn);
    while ((row = mysql_fetch_row(res)) != NULL) /* somesort of linked list, that iterates on each row in the resualt */
    {
        okay("%s\t%s", row[0], row[1]); // Adjust based on your table structure
    }
    mysql_free_result(res); /* frees the used resources */
    mysql_close(conn); /* closes the mysql socket connection */
    return EXIT_SUCCESS;
}