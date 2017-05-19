#!/bin/bash

if [ -f "stop.sh" ]; then
    ./stop.sh
fi

echo -e "\n> Update 'master' branch:"
git pull
echo -e "< Already updated."

branchs=("core" "browser" "server")
for branch in ${branchs[@]}; do
    outdir=PixelPet3D-$branch
    if [ ! -d "$outdir" ]; then
        echo -e "\n> Clone '$branch' branch:"
        git clone git@github.com:zhengxiaoyao0716/PixelPet3D.git -b $branch $outdir
        echo -e "< Cloned into '$outdir'."
    else
        echo -e "\n> Pull '$branch' branch:"
        git pull
        echo -e "< Pull into '$outdir'."
    fi
done

echo -e "\n> Build and run core-module from 'core' branch:"
cd PixelPet3D-core
make build
nohup ./out/PixelPet3D-core &
core_pid=$!
cd ..
echo -e "< Core-module runing, pid=$core_pid, logged to PixelPet3D-core/nohup.out."

echo -e "\n> Config and start server from 'server' branch:"
cd PixelPet3D-server
pip install -r requirements.txt -q
chmod u+x main.py
nohup ./main.py -u &
server_pid=$!
cd ..
echo -e "< Server started, pid=$server_pid, logged to PixelPet3D-server/nohup.out."

clean="#!/bin/bash\n"
clean=$clean"\n"
clean=$clean"echo -e \"\0134n> Stop and clean:\";\n"
clean=$clean"\n"
clean=$clean"core_pid=$core_pid\n"
clean=$clean"server_pid=$server_pid\n"
clean=$clean"\n"
clean=$clean"branchs=(\"core\" \"server\")\n"
clean=$clean"for branch in \${branchs[@]}; do\n"
clean=$clean"\tpidvar=\\\$\${branch}_pid\n"
clean=$clean"\tpid=\`eval echo \$pidvar\`\n"
clean=$clean"\tcwd=/proc/\$pid/cwd\n"
clean=$clean"\tif [ -d \"\$cwd\" ]; then\n"
clean=$clean"\t\tif [[ \`ls -l \$cwd | awk '{print \$11}'\` =~ \"PixelPet3D-\$branch\" ]]; then\n"
clean=$clean"\t\t\tkill \$pid\n"
clean=$clean"\t\t\techo -e \"* Killed \$branch branch, pid=\$pid.\"\n"
clean=$clean"\t\tfi\n"
clean=$clean"\tfi\n"
clean=$clean"done\n"
clean=$clean"\n"
clean=$clean"rm .pp3d-*.sock */nohup.out stop.sh -f\n"
clean=$clean"\n"
clean=$clean"echo -e \"< Finish.\n\""
echo -e $clean > stop.sh
chmod u+x stop.sh

while : ; do
    sleep 0.1
    echo -e ".\c"
    if [ -f "PixelPet3D-core/nohup.out" ]; then
        if [ -f "PixelPet3D-server/nohup.out" ]; then
            break
        fi
    fi
done

echo -e ""

while getopts "dh" opt; do
    case $opt in
        d) exit 0;;
        ?) echo -e "* Use '-d' argument to run in background.";;
    esac
done

trap "./stop.sh; exit 2" 1 2 3 15
tail -f PixelPet3D-core/nohup.out PixelPet3D-server/nohup.out
