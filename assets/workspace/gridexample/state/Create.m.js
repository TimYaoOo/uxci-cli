$define("workspace.gridexample.state.Create",function () {
    return {
        onMouseDown:function (evt,c) {
            const me = this,size = me.gridSize, box = me.data.draggingBox;
            if(c.selected){
                return;
            }
            me.data.cursor = "cell";
            box.bg = "";
            box.status = "creating";
            box.start = c;
            box.x = (c.c - 1)*size;
            box.y = (c.r - 1)*size;
        },
        onMouseUp:function (evt,c) {
            const me = this,box = me.data.draggingBox,start = box.start,size = me.gridSize,gridData = me.data.gridData;

            me.data.cursor = 'default';
            box.status = "";
            box.w = box.h = size;
            if(!start || c == start){
                return;
            }

            let selectedCells = me.getSelectedCells(box.start,c);
            box.start = null;
            if(selectedCells){

                let bg = me.nextColor();
                let areaId = ++me.areasIdSeed;
                let area = {
                    id:areaId,
                    color:bg,
                    active:false,
                    moving:false,
                    overlap:false
                };
                me.updateAreaCells(area,selectedCells);
                me.data.areas.push(area);
            }

        },
        onMouseMove:function (evt,c) {
            const me = this;
            me.recalculateDraggingBox(c)
        },
        onDblClick:$emptyFunction,
        exit:function () {
            const me = this, box = me.data.draggingBox,size = me.gridSize;
            box.status = "";
            box.w = box.h = size;
        }
    }
});