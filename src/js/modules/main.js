var GameApp = (function() {
    var $app = $('.app');
    var $cellsWrap = $('.real-cels');
    var $curScore = $('.js-cur-score');
    var $lastcurScore = $('.js-last-cur-score');
    var $bestScore = $('.js-best-score');
    var $lastbestScore = $('.js-last-best-score');
    var $undoBtn = $('.js-undo');
    var $newGameBtn = $('.js-new-game');
    var $newGameLine = $('.new-game-line');
    var $handleHtml = $('#undo').html();
    var $handleTemplate;
    var SIZE = 4;
    var score = 0;
    var cellsHistory=[];
    var cells = {};

    var fn = {
        getRandomInt: function(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        },
        fourOrTwo: function () {
            return (fn.getRandomInt(0,10) > 7)?4:2;
        },
        setScore: function (newNum) {
            score += newNum;
            if(parseInt($curScore.html()) < score){
                $lastcurScore.html('+'+(score - parseInt($curScore.html()))).addClass('moved');
                $curScore.html(score);
                setTimeout(function () {
                    $lastcurScore.removeClass('moved');
                    $lastbestScore.removeClass('moved');
                },200);
            }
            if(parseInt($bestScore.html()) < score){
                $lastbestScore.html('+'+(score - parseInt($bestScore.html()))).addClass('moved');
                $bestScore.html(score);
                fn.localStorBest(score);
            }
        },
        getFreeCells: function () {
            var freeCels = [];
            var score = 0;
            for(var i = 0; i < SIZE; i++){
                for(var j =0; j < SIZE; j++){
                    if(cells[i][j] == 0){
                        freeCels.push(''+[i]+[j]);
                    } else {
                        score +=cells[i][j];
                    }
                }
            }
            return freeCels;
        },
        newRandCell: function () {
            var freeCels = fn.getFreeCells();
            var needCell = freeCels[fn.getRandomInt(0,freeCels.length-1)];
            var datax = needCell.slice(0,1);
            var datay = needCell.slice(1,2);
            var datanum = fn.fourOrTwo();
            cells[datax][datay] = datanum;
            $cellsWrap.append('<div class="cell" data-x="'+datax+'" data-y="'+datay+'" data-num="'+datanum+'"></div>');
            var toPush = {score: score,cells:cells};
            cellsHistory.push(jQuery.extend(true,{}, toPush));
            fn.localStorGame(toPush);
            if(cellsHistory.length > 2){
                $undoBtn.removeClass('disabled');
            }
        },
        localStorBest: function (num) {
            if(num){
                localStorage.setItem('best'+SIZE,num);
            } else {
                var best = localStorage.getItem('best'+SIZE);
                if(best){
                    $bestScore.html(best);
                } else {
                    $bestScore.html(0);
                }
            }
        },
        localStorGame: function (data) {
            if(data){
                data.size = SIZE;
                localStorage.setItem('game',JSON.stringify(data));
            }else{
                var game = JSON.parse(localStorage.getItem('game'));
                if(game){
                    return game;
                } else {
                    return false;
                }
            }
        },
        chPos: function (indata,outdata) {
            $cellsWrap.find('.cell[data-x="'+indata.x+'"][data-y="'+indata.y+'"]').attr('data-x',outdata.x).attr('data-y',outdata.y);
        },
        compare: function (indata,outdata) {
            var $fcell = $cellsWrap.find('.cell[data-x="'+indata.x+'"][data-y="'+indata.y+'"]');
            var $scell = $cellsWrap.find('.cell[data-x="'+outdata.x+'"][data-y="'+outdata.y+'"]');
            $fcell.attr('data-x',outdata.x).attr('data-y',outdata.y);
            fn.setScore(outdata.num);
            setTimeout(function () {
                $scell.attr('data-num',outdata.num).addClass('compare');
                setTimeout(function () {
                    $scell.removeClass('compare');
                },100);
                $fcell.remove();
            },100);
        },
        move:function (type) {
            switch (type) {
                case 'top':
                    for(var i = 0; i < SIZE; i++){
                        for(var j = 0; j < SIZE; j++){
                            if(cells[i][j]){
                                var row = j;
                                while (row > 0){
                                    if(!cells[i][row-1]){
                                        cells[i][row-1] = cells[i][row];
                                        cells[i][row]=0;
                                        fn.chPos({x:i,y:row},{x:i,y:row-1});
                                        row--;
                                    } else if (cells[i][row-1] == cells[i][row]){
                                        cells[i][row-1] *= 2;
                                        fn.compare({x:i,y:row},{x:i,y:row-1,num:cells[i][row-1]});
                                        cells[i][row] = 0;
                                    } else {
                                        break;
                                    }
                                }
                            }
                        }
                    }
                    break;
                case 'down':
                    for(var i = 0; i < SIZE; i++){
                        for(var j = (SIZE-1); j >=0; j--){
                            if(cells[i][j]){
                                var row = j;
                                while (row < SIZE-1){
                                    if(!cells[i][row+1]){
                                        cells[i][row+1] = cells[i][row];
                                        cells[i][row]=0;
                                        fn.chPos({x:i,y:row},{x:i,y:row+1});
                                        row++;
                                    } else if (cells[i][row+1] == cells[i][row]){
                                        cells[i][row+1] *= 2;
                                        fn.compare({x:i,y:row},{x:i,y:row+1,num:cells[i][row+1]});
                                        cells[i][row] = 0;
                                    } else {
                                        break;
                                    }
                                }
                            }
                        }
                    }
                    break;
                case 'left':
                    for(var i = 0; i < SIZE; i++){
                        for(var j = 0; j < SIZE; j++){
                            if(cells[i][j]){
                                var row = i;
                                while (row > 0){
                                    if(!cells[row-1][j]){
                                        cells[row-1][j] = cells[row][j];
                                        cells[row][j]=0;
                                        fn.chPos({x:row,y:j},{x:row-1,y:j});
                                        row--;
                                    } else if (cells[row-1][j] == cells[row][j]){
                                        cells[row-1][j] *= 2;
                                        fn.compare({x:row,y:j},{x:row-1,y:j,num:cells[row-1][j]});
                                        cells[row][j] = 0;
                                    } else {
                                        break;
                                    }
                                }
                            }
                        }
                    }
                    break;
                case 'right':
                    for(var i = (SIZE-1); i >=0; i--){
                        for(var j = 0; j < SIZE; j++){
                            if(cells[i][j]){
                                var row = i;
                                while (row < SIZE-1){
                                    if(!cells[row+1][j]){
                                        cells[row+1][j] = cells[row][j];
                                        cells[row][j]=0;
                                        fn.chPos({x:row,y:j},{x:row+1,y:j});
                                        row++;
                                    } else if (cells[row+1][j] == cells[row][j]){
                                        cells[row+1][j] *= 2;
                                        fn.compare({x:row,y:j},{x:row+1,y:j,num:cells[row+1][j]});
                                        cells[row][j] = 0;
                                    } else {
                                        break;
                                    }
                                }
                            }
                        }
                    }
                    break;
            }
            fn.afterMove();
        },
        afterMove: function () {
            var obj1 = cellsHistory[cellsHistory.length-1].cells;
            var isEqual = JSON.stringify(obj1) === JSON.stringify(cells);
            if(!isEqual){
                fn.newRandCell();
            }
        },
        renderNewGrid:function () {
            SIZE = parseInt($app.attr('data-size'));
            $undoBtn.addClass('disabled');
            $cellsWrap.html('');
            $lastcurScore.removeClass('moved');
            $lastbestScore.removeClass('moved');
            $curScore.html(0);
            $lastcurScore.removeClass('moved');
            $lastbestScore.removeClass('moved');
            cellsHistory=[];
            score=0;
            cells = {};
            for(var i = 0; i < SIZE; i++){
                cells[i] ={};
                for(var j =0; j < SIZE; j++){
                    cells[i][j] = 0;
                }
            }
            fn.newRandCell();
            fn.newRandCell();
            fn.localStorBest();
        },
        compileFromHandle: function () {
            $cellsWrap.html($handleTemplate(cells));
        },
        undo: function () {
            if(!$undoBtn.hasClass('disabled')){
                cellsHistory.splice(cellsHistory.length-1, 1);
                cells = jQuery.extend(true,{}, cellsHistory[cellsHistory.length - 1].cells);
                score = cellsHistory[cellsHistory.length - 1].score;
                $curScore.html(cellsHistory[cellsHistory.length - 1].score);
                fn.localStorGame(cellsHistory[cellsHistory.length - 1]);
                fn.compileFromHandle();
                if(cellsHistory.length < 3){
                    $undoBtn.addClass('disabled');
                }
            }
        }
    };

    var fnInit = {
        initialize: function () {
            $handleTemplate = Handlebars.compile($handleHtml);
            var localSrGame = fn.localStorGame();
            if(localSrGame) {
                SIZE = localSrGame.size;
                $app.attr('data-size',SIZE);
                score = localSrGame.score;
                $curScore.html(score);
                cells = localSrGame.cells;
                cellsHistory.push({score:score,cells: jQuery.extend(true,{}, cells)});
                fn.compileFromHandle(cells);
                fn.localStorBest();
            } else {
                fn.renderNewGrid();
            }
        },
        actions: function () {
            $(document).on('keydown',function (e) {
                switch (e.which){
                    case 37:
                    case 65:
                        fn.move('left');
                        break;
                    case 38:
                    case 87:
                        fn.move('top');
                        break;
                    case 39:
                    case 68:
                        fn.move('right');
                        break;
                    case 40:
                    case 83:
                        fn.move('down');
                        break;
                    case 8:
                        break;
                }
            });
        },
        undo:function () {
            $undoBtn.on('click', function () {
                fn.undo();
            });
        },
        newGame:function () {
            $newGameBtn.on('click', function () {
                $newGameLine.find('.ng-item').removeClass('activate');
                $newGameLine.find('.ng-item[data-size="'+SIZE+'"]').addClass('activate');
                $newGameLine.toggleClass('opened');
            });
            $newGameLine.on('click','.ng-item', function () {
                var $this = $(this);
                $newGameLine.removeClass('opened');
                $newGameLine.find('.ng-item').removeClass('activate');
                $this.addClass('activate');
                $app.attr('data-size',$this.attr('data-size'));
                fn.renderNewGrid();
            });
        }
    };

    return {
        init: function() {
            for (var prop in fnInit) {
                if (fnInit.hasOwnProperty(prop) && typeof jQuery.isFunction(fnInit[prop])) {
                    fnInit[prop]();
                }
            }
        }
    }
}());
$(function () {
    GameApp.init();
});
