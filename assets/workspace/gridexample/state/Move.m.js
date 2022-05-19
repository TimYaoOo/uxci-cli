$define("workspace.gridexample.state.Move",function () {

    let boxStart = null;
    let mouseStart = null;
    let currentEnd = null;
    let maxCfltArea = null;

    return {
       onMouseDown:function (evt,c) {
           const  me = this,box = me.data.draggingBox,area = me.activeArea;
           boxStart = box.start;
           mouseStart = c;
           area.moving = true;
           box.bg = area.color;
       },
       onMouseUp:function (evt,c) {
           const me = this,area = me.activeArea,data = me.data,gridData = data.gridData,box = data.draggingBox;

           area.moving = false;
           if(c == mouseStart || currentEnd == null){
               me.currentState = me.states.select;
               return;
           }

           //switch
           if(maxCfltArea && maxCfltArea.id == c.areaId){
               let temp = {
                   r:area.r,
                   c:area.c,
                   w:area.w,
                   h:area.h
               };
               let to    = maxCfltArea;
               let start = gridData[to.r - 1][to.c - 1];
               let end   = gridData[to.r + to.h - 2][to.c + to.w -2];
               let cells = me.getSelectedCells(start,end,to.id);
               me.updateAreaCells(area,cells);

               box.start = start;
               me.recalculateDraggingBox(cells[cells.length - 1]);

               start = gridData[temp.r - 1][temp.c - 1];
               end   = gridData[temp.r + temp.h - 2][temp.c + temp.w -2];
               cells = me.getSelectedCells(start,end,area.id);
               me.updateAreaCells(to,cells);

               $nextTick(function () {
                   me.onAreaResize(area);
                   me.onAreaResize(to);
               });
               data.cursor = 'move';

           }
           else{
               const selectedCells = me.getSelectedCells(box.start,currentEnd,area.id);
               if(selectedCells){
                   me.clearAreaCells(area);
                   me.updateAreaCells(area,selectedCells);
               }
               else{
                   box.start = boxStart;
                   let end = gridData[boxStart.r + area.h -2][boxStart.c + area.w - 2];
                   me.recalculateDraggingBox(end);
               }
           }

           me.currentState = me.states.select;
           boxStart = null;
           mouseStart = null;
           currentEnd = null;

           if(maxCfltArea){
               maxCfltArea.overlap = false;
               maxCfltArea = null;
           }
       },
       onMouseMove:function (evt,c) {
           const  me = this,area = me.activeArea,data = me.data,gridData = data.gridData,box = data.draggingBox;
           const colSpan = c.c - mouseStart.c;
           const rowSpan = c.r - mouseStart.r;

           if(rowSpan == 0 && colSpan == 0 && currentEnd == null){
               return;
           }

           const i = boxStart.r + rowSpan - 1;
           const j = boxStart.c + colSpan - 1;

           if(i < 0 || i >= gridData.length){
               return;
           }
           const row = gridData[i];
           if(j < 0 || j >= row.length){
               return;
           }
           const start = row[j];
           currentEnd = gridData[start.r + area.h - 2][start.c + area.w - 2];
           if(currentEnd){
               box.start = start;
               me.recalculateDraggingBox(currentEnd);
               let ca = me.findMaxConflictingArea(start,currentEnd,area.id);
               data.cursor = 'move';
               if(ca) {
                   ca.overlap = true;
                   if (maxCfltArea && maxCfltArea != ca) {
                       maxCfltArea.overlap = false;
                   }
                   if(ca.id == c.areaId){
                        data.cursor = 'col-resize';
                   }
               }
               else if(maxCfltArea){
                   maxCfltArea.overlap = false;
               }
               maxCfltArea = ca;
           }

       },
       onDblClick:$emptyFunction,
       exit:function () {
           const me = this, box = me.data.draggingBox;
           box.status = "";
           boxStart = null;
           mouseStart = null;
           currentEnd = null;
           if(maxCfltArea){
               maxCfltArea.overlap = false;
               maxCfltArea = null;
           }
       }
   }
});