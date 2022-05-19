$class("workspace.gridexample.GridLayoutDemo", {
    extend: "/ssdev.ux.vue.VueContainer",
    css: "/workspace.gridexample.css.grid",
    tpl: "/",
    mixins:"ssdev.utils.ServiceSupport",
    deps:[
        "/workspace.gridexample.GridAreaContainer",
        "/workspace.gridexample.state.Create",
        "/workspace.gridexample.state.Select",
        "/workspace.gridexample.state.Move",
        "/workspace.gridexample.state.Resize"
    ],
    areasIdSeed:0,
    selectedBgColors:["#7dddce","#7f8fc9","#878787","#a27e83","#8B564B"],
    selectedColorIndex:-1,
    defaultCellColor:"#c0c0c0",
    gridSize:48,
    currentState:null,
    initComponent:function (conf) {
        const me = this;
        me.setupService([{
            beanName:"demo.helloService",
            method:"hello"
        }]);
        const states = {
            create: workspace.gridexample.state.Create,
            select: workspace.gridexample.state.Select,
            move:   workspace.gridexample.state.Move,
            resize: workspace.gridexample.state.Resize
        };
        me.states = states;
        me.service.hello()
        me.evtHandlers = {
            handleMouseDown:function (evt,c) {
                let newSate = null;
                if(c.selected){
                    newSate = states.select;
                    if(me.currentState && newSate != me.currentState){
                        me.currentState.exit.call(me);
                    }
                }
                else{
                    newSate = states.create;
                    if(me.currentState){
                        me.currentState.exit.call(me);
                    }
                }

                me.currentState = newSate;
                me.currentState.onMouseDown.call(me,evt,c)
            },
            handleMouseUp:function (evt,c) {
                if(!me.currentState){
                    return;
                }
                me.currentState.onMouseUp.call(me,evt,c);
            },
            handleMouseOver:function (evt,c) {
                if(!me.currentState){
                    return;
                }
                me.currentState.onMouseMove.call(me,evt,c)
            },
            handleDblClick:function (evt,c) {
                if(!me.currentState){
                    return;
                }
                me.currentState.onDblClick.call(me,evt,c)
            },
            handleDelKeyUp:function (evt) {
                const  data = me.data,area = me.activeArea,areas = data.areas;
                if(evt.key == 'Delete' && area){
                    let i = areas.findIndex(function (t) {
                        return t.id == area.id;
                    });
                    areas.splice(i,1);
                    me.clearAreaCells(area);
                    me.currentState.exit.call(me);
                    me.currentState = null;
                }
            }
        };

        document.addEventListener("keydown",me.evtHandlers.handleDelKeyUp);

        const size = me.gridSize;
        me.data = {
            cursor:'default',
            draggingBox:{start:null,resizeMode:null,x:0,y:0,w:size,h:size,bg:""},
            areas:[],
            gridData:[],
            gridSize:size
        };
        me.callParent(arguments);
    },
    afterAppend:function(){
        const me = this,el = me.el,gridData = me.data.gridData,size = me.gridSize;
        $nextTick(function () {
            let rows = Math.floor(el.clientHeight / size);
            let cols = Math.floor(el.clientWidth / size);

            let defaultCellColor = me.defaultCellColor;
            for(let r = 1; r <= rows; r ++){
                let row = [];
                for(let c = 1; c <= cols; c ++){
                    let data = {
                        r:r,
                        c:c,
                        selected:false,
                        bg:defaultCellColor,
                        id: r + "/" + c,
                    };
                    row.push(data);
                }
                gridData.push(row);
            }

            me.offsetX = (el.clientWidth -  cols * size) / 2;
        })

    },
    onAreaDblClick:function(area){
        const me = this,el = me.el;
        let areaEl = el.querySelector(".areas > #area-" + area.id);
        if(!area.ct){
            let ct = new workspace.gridexample.GridAreaContainer();
            ct.appendTo(areaEl);
            area.ct = ct;
            area.color = "";

            let num =  Math.floor(Math.random() * 10);
            ct.setModule({
                cls:'/demo.chart.Chart',
                conf:{
                    chartId:num
                }
            });
        }
    },
    onAreaResize:function(area){
        const ct = area.ct;
        if(ct && $is.Function(ct.onResize)){
            ct.onResize();
        }
    },
    recalculateDraggingBox : function(c){
        const me = this,box = me.data.draggingBox,start = box.start,size = me.gridSize;
        if(!start || c == start){
            return;
        }
        box.x  = (Math.min(c.c,start.c) - 1)*size;
        box.y  = (Math.min(c.r,start.r) - 1)*size;
        box.w  = (Math.abs(c.c - start.c) + 1)*size;
        box.h  = (Math.abs(c.r - start.r) + 1)*size;
    },
    updateAreaCells:function(area,cells){
        const start = cells[0],end = cells[cells.length-1];
        const w = end.c - start.c + 1,h = end.r - start.r + 1;

        area.r = start.r;
        area.c = start.c;
        area.w = w;
        area.h = h;
        area.loc = [start.r,start.c,'span ' + h,'span ' + w].join("/");

        cells.forEach(function (c) {
            c.selected = true;
            c.areaId = area.id;
        });
    },
    clearAreaCells:function(area){
        const me = this,gridData = me.data.gridData;

        const rs = area.r - 1;
        const re = area.r + area.h - 1;
        const cs = area.c - 1;
        const ce = area.c + area.w - 1;

        for(let i = rs; i < re; i ++){
            for(let j = cs; j < ce; j ++){
                let cell = gridData[i][j];
                cell.selected = false;
                cell.areaId = null;
            }
        }

    },
    getSelectedCells:function(start,end,ownAreaId){
        const  me = this,gridData = me.data.gridData;

        const rs = Math.min(start.r,end.r);
        const re = Math.max(start.r,end.r);
        const cs = Math.min(start.c,end.c);
        const ce = Math.max(start.c,end.c);

        const selectedCells = [];
        for(let i = rs; i <= re; i ++){
            for(let j = cs; j <= ce; j ++){
                let cell = gridData[i - 1][j - 1];
                if(cell.selected && cell.areaId != ownAreaId){
                    return
                }
                selectedCells.push(cell)
            }
        }
        return selectedCells;
    },
    findMaxConflictingArea:function(start,end,ownAreaId){
        const  me = this,gridData = me.data.gridData,areas = me.data.areas;

        const rs = Math.min(start.r,end.r);
        const re = Math.max(start.r,end.r);
        const cs = Math.min(start.c,end.c);
        const ce = Math.max(start.c,end.c);

        let stat = {};
        for(let i = rs; i <= re; i ++){
            for(let j = cs; j <= ce; j ++){
                let cell = gridData[i - 1][j - 1];
                let areaId = cell.areaId;
                if(cell.selected && areaId != ownAreaId) {
                    if (stat[areaId]) {
                        ++stat[areaId];
                    } else {
                        stat[areaId] = 1;
                    }
                }
            }
        }

        let max = 0;
        let find = null;
        Object.keys(stat).forEach(function (id) {
           let num = stat[id];
           if(num > max){
               max = num;
               find = id;
           }
        });

        if(find){
            return areas.find(function (t) {
                return t.id == find;
            })
        }
    },
    nextColor : function(){
        const me = this,selectedBgColors = me.selectedBgColors;
        let index = me.selectedColorIndex;
        if(index == selectedBgColors.length){
            index = -1;
        }
        else{
            index ++;
        }
        me.selectedColorIndex = index;
        return selectedBgColors[index];
    },
    destroy:function () {
        const me = this;
        document.removeEventListener("keydown",me.evtHandlers.handleDelKeyUp)
    }
});