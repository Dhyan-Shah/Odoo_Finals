const initSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Join rooms
    socket.on('join:table', (tableId) => {
      socket.join(`table_${tableId}`);
      console.log(`Socket ${socket.id} joined table_${tableId}`);
    });

    socket.on('join:waiter', (waiterId) => {
      socket.join(`waiter_${waiterId}`);
      console.log(`Socket ${socket.id} joined waiter_${waiterId}`);
    });

    socket.on('join:kitchen', () => {
      socket.join('kitchen');
      console.log(`Socket ${socket.id} joined kitchen`);
    });

    socket.on('join:admin', () => {
      socket.join('admin');
      console.log(`Socket ${socket.id} joined admin`);
    });

    socket.on('leave:table', (tableId) => {
      socket.leave(`table_${tableId}`);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};

module.exports = { initSocket };
