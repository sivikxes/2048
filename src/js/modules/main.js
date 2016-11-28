var line = {
    0:4,
    1:2,
    2:4,
    3:2
};
for(var i = 0; i < 4; i++){
    if(line[i]){
        var row = i;
        while (row > 0){
            if(!line[row-1]){
                line[row-1] = line[row];
                line[row]=0;
                row--;
            } else if (line[row-1] == line[row]){
                line[row-1] *= 2;
                line[row] = 0;
            } else {
                break;
            }
        }
    }
}
console.log(line);