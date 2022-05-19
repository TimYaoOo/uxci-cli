$define("workspace.gridexample.state.Resize",function () {
    let currentEnd;

    return {
       onMouseDown:$emptyFunction,
       onMouseUp:function (evt,c) {
           const  me = this,data = me.data,area = me.activeArea,box = data.draggingBox,gridData = data.gridData;
           if(currentEnd){
               const selectedCells = me.getSelectedCells(box.start,currentEnd,area.id);
               if(selectedCells){

                   me.clearAreaCells(area);
                   me.updateAreaCells(area,selectedCells);

                   let first = selectedCells[0];
                   if(box.start != first){
                       box.start = first;
                   }
                   $nextTick(function () {
                       me.onAreaResize(area);
                   });
               }
               else{
                    box.start = gridData[area.r -1][area.c -1];
                    let end = gridData[area.r + area.h - 2][area.c + area.w -2];
                    me.recalculateDraggingBox(end);
               }
           }
           currentEnd = null;
           box.resizeMode = null;
           me.currentState = me.states.select;
       },
       onMouseMove:function (evt,c) {
           const  me = this,data = me.data,area = me.activeArea,box = data.draggingBox,gridData = data.gridData;
           let er,ec;
           switch (box.resizeMode) {
               case 'e':
                   er = area.r + area.h - 2;
                   ec = c.c - 1;
                   break;

               case 'ne':
                   er = area.r + area.h - 2;
                   ec = c.c - 1;
                   box.start = gridData[c.r -1][area.c - 1];
                   break;

               case 'se':
                   er = c.r - 1;
                   ec = c.c - 1;
                   break;

               case "s":
                   er = c.r - 1;
                   ec = area.c + area.w - 2;
                   break;

               case "w":
                   er = area.r + area.h - 2;
                   ec = area.c + area.w - 2;
                   box.start = gridData[area.r -1][c.c - 1];
                   break;

               case 'nw':
                   er = area.r + area.h - 2;
                   ec = area.c + area.w - 2;
                   box.start = gridData[c.r -1][c.c -1];
                   break;

               case 'sw':
                   er = c.r - 1;
                   ec = area.c + area.w - 2;
                   box.start = gridData[area.r -1][c.c -1];
                   break;


               case "n":
                   er = area.r + area.h - 2;
                   ec = area.c + area.w - 2;
                   box.start = gridData[c.r -1][area.c - 1];
                   break;
           }
           box.status = 'selected';
           currentEnd = gridData[er][ec];
           me.recalculateDraggingBox(currentEnd);
           let ca = me.findMaxConflictingArea(box.start,currentEnd,area.id);
           if(ca){
                box.status = 'invalid';
           }

       },
       onDblClick:$emptyFunction,
       exit:function () {
           const me = this, box = me.data.draggingBox;
           box.status = "";
       }
   }
});