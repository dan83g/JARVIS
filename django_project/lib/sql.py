def connection_string(driver, host, port, instance, database, user, password):
    return r"DRIVER={driver};SERVER={host}{instance}{port};DATABASE={database};UID={user};PWD={password};".format(
        driver=driver,
        host=host,
        instance="" if not instance else f"\\{instance}",
        port="" if port in (None, 0, 1433) else f",{port}",
        database=database,
        user=user,
        password=password
    )
