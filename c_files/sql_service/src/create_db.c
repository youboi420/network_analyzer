#include "../includes/db.h"
#include "../includes/service.h"

#define COMMAND "create database testcdb"\
"use testcdb"\
"create table testfromc("\
"employee_id varchar(50),"\
"first_name varchar(50),"\
"last_name varchar(50),"\
"hourly_pay decimal(5, 2),"\
"hire_date DATE"\
");"\

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
        return EXIT_FAILURE;
    }
    if (mysql_real_connect(conn, HOST, USER, PASSWORD, NULL, 0, NULL, 0) == NULL)
    {
        error("mysql_real_connect() failed");
        mysql_close(conn);
        return EXIT_FAILURE;
    }
    if (mysql_query(conn, COMMAND)) {
        error(COMMAND" execution failed ([code:%d]|[msg:%s])", mysql_errno(conn), mysql_error(conn));
        mysql_close(conn);
        return EXIT_FAILURE;
    }
    mysql_free_result(res); /* frees the used resources */
    mysql_close(conn); /* closes the mysql socket connection */
    return EXIT_SUCCESS;
}