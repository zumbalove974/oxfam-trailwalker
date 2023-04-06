test('adds 1 + 2 to equal 3', () => {
    expect(1 + 2).toBe(3);
});

//Pour pouvoir utiliser pgmock2:
//Remplacer router.pool par le client de pgmock2, et faire un client.connect()