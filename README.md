# passwordtest

populate DB: 

    mongo
    use passporttest
    db.userInfo.insert({'username':'admin','password':'admin'});
    db.userInfo.find();
