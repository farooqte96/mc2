import sys
import subprocess
from subprocess import call, Popen, PIPE
from subprocess import check_output
from threading import Thread
import time
import psutil
# import network_utilization as net

import json
class mydict(dict):
        def __str__(self):
            return json.dumps(self)

def cpu(timeout):
    curr = 0
    sum = 0
    iter = 0
    step_interval = 0.3
    while curr < timeout:
        start = time.time()
        # out = check_output(['mpstat'])
        # last = out.split("\n")[3]

        # print last
        # utilization = last.split()
        # print utilization
        # sum += float(utilization[3])
        util = get_cpu_percent()
        sum += util
        # print util
        curr += step_interval
        iter += 1
        # print('Iteration:'+str(iter))
        time.sleep(max(0, step_interval - (time.time() - start)))

    return sum / float(iter)


def get_cpu_percent():
    return psutil.cpu_percent()

# print(cpu(2))
def show_cpu_percent():
    agent={"cpu":cpu(0.3),"gpu":gpu(0.3)}
    return mydict(agent)

# ########
def get_gpu_percent():
    return float(check_output(['nvidia-smi', '--query-gpu=utilization.gpu', '--format=csv,noheader,nounits']))

def gpu(timeout):
    curr = 0
    sum = 0
    iter = 0
    step_interval = 0.3
    while curr < timeout:
        start = time.time()
        # last = out.split("\n")[3]
        # print last
        # utilization = last.split()
        # print utilization
        # sum += float(utilization[3])
        util = get_gpu_percent()
        sum += util
        # print util
        curr += step_interval
        iter += 1
        time.sleep(max(0, step_interval - (time.time() - start)))

    return sum / float(iter)
#
#
# print(gpu(2))

print(show_cpu_percent())
