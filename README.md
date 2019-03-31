# Resource Management in Container Based Mobile Edge Computing

In this project, we  developed a resource manager for container-based edge computing.The key features include:

* Registration of edge nodes. Each edge node  report its available CPU/GPU cores and memory to the resource manager
* Application profiling that defines the maximum quota in terms of cpu, gpu and ram for each application.
* Dashboard that provides a web-based user interfaces for configuring and launching containers. It includes scripts for automatic configuration of networking and GPU passthrough.
* Container migration between edge nodes. One way to schedule the handover is to monitor and predict the change in Wi-Fi RSSI. Other way is to schedule handover based on system resource utilization
* Management of task allocation strategies. We plan to implement a couple of task allocation strategies  during the course of the project.

# Master Server Vs Edge Nodes:
In this project, we control any process execution and monitoring of edge nodes through a centralized nodejs server. Every Edge Node act as client (socket.io.client) to server and depending on its role sends valuable information to server at real time. For example, if we have a edge node with role consumer, then it has to send system utilization evry 5 sec to keep track of its health. Master server and client communicate with each other through socket.io  events. Each event is triggered uniquely for each edge node and response is sent back to server. From server GUI, we can do following taks:

* Register/Edit and save Edge Node + other nodes information via html form (containing node ip, network, role, ssh key fields).
* Deploy containers as a service on any node with given parameters and show the deployed applications on main dashboard. We can also delete the deployed applications by clicking the application name.
* Migrate containers from source node to destination node and see the migration time as response.
* Monitor all nodes  by executing cadvisor container on each node. We use cadvisor to show the all deployed containers on those nodes and system utilization information such as CPU, Memory etc. However we have a separate script on each edge node to send system utilization information (cpu, gpu and ram information ) every 5 sec to server and take decisions based on that information. 

### A video tour on basic features
[![MEC Demo Video](http://www.systemsolutionsdevelopment.com/wp-content/uploads/2017/07/Product-DemoVideo-1.jpg)](https://vimeo.com/277253909)

# Read Complete Thesis:
Access my thesis [[here](https://aaltodoc.aalto.fi/bitstream/handle/123456789/34370/master_Tufail_Muhammad_2018.pdf?sequence=1&isAllowed=y)]


# System Installation and Usage:
* Git pull the repository conatining master and consumer directories.
* Copy master directory to node which has to act as master and consumer directory to node which has to server as edge node.
* On each node (including master), install node and use node package manager (npm) tool to install the package.json file containing all required modules information.
* Activate master by executing node app.js and edge node by executing node consumer.js
* Now you should see a server running on port 3000 of your device. After configuring ssh-access from server to each edge node and among all edge nodes, we are ready to register edge nodes, deploy some services on them and can also monitor their state in real time.
* In server directory, by default service migration is handled by algorithm1 (containing into preference of edge node from same network). However, to test scenarios for economical migration, algorithm2 configuration file is also made avilable in master files.


