#build targets array:
targets=( "circular-gauge" "value-display" )

#build each target:
for target in "${targets[@]}"
do
    echo "Building $target..."
    cd $target
    npn run local-install
    cd ..
done