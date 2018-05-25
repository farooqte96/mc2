
var socket=io();
socket.emit('cpu_stats');
socket.on('system_utilization', (system_utilization) => {
  console.log(system_utilization);
  setTimeout(()=> socket.emit('cpu_stats'),2000);
});
