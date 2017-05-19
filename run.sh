#!/bin/bash

branchs=("core" "browser" "server")
for branch in ${branchs[@]}
do
    outdir=PixelPet3D-$branch
    if [ ! -d "$outdir" ]; then
        echo -e "\n> Clone '$branch' branch:"
        git clone git@github.com:zhengxiaoyao0716/PixelPet3D.git -b $branch $outdir
        echo -e "> Cloned into '$outdir'."
    fi
done

echo -e "\n> Build and run core-module from 'core' branch:"
cd PixelPet3D-core
make build
nohup ./out/PixelPet3D-core &
core_pid=$!
cd ..
echo -e "> Core-module runing, pid=$core_pid, logged to PixelPet3D-core/nohup.out."

echo -e "\n> Config and start server from 'server' branch:"
cd PixelPet3D-server
chmod u+x main.py
nohup ./main.py -u &
server_pid=$!
cd ..
echo -e "> Server started, pid=$server_pid, logged to PixelPet3D-server/nohup.out."

trap "kill $core_pid $server_pid; rm .pp3d-*.sock */nohup.out stop.sh -f; echo -e \"\n> Stop and clean.\"; exit 2" 1 2 3 15

while :
do
    sleep 0.1
    echo -e ".\c"
    if [ -f "PixelPet3D-core/nohup.out" ]; then
        if [ -f "PixelPet3D-server/nohup.out" ]; then
            break
        fi
    fi
done

echo -e ""
tail -f PixelPet3D-core/nohup.out PixelPet3D-server/nohup.out
