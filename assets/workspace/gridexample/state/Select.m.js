$define("workspace.gridexample.state.Select",function () {
   const resizePadding = 10;

   const resizeModeDecider = [];

    resizeModeDecider.push(function (c,area,x,y,gridSize) {
                            let result = {};
                            if(c.c == area.c){
                                if(x >= 0 && x <= resizePadding){
                                    if(c.r == area.r && y >= 0 && y <= resizePadding){
                                        result.cursor = 'nwse-resize';
                                        result.resizeMode = 'nw';
                                    }
                                    else if(c.r == area.r + area.h -1 && y >= gridSize - resizePadding && y <= gridSize){
                                        result.cursor = 'nesw-resize';
                                        result.resizeMode = 'sw';
                                    }
                                    else{
                                        result.cursor = 'ew-resize';
                                        result.resizeMode = 'w'
                                    }
                                    return result;
                                }
                            }
                        },function (c,area,x,y,gridSize) {
                            let result = {};
                            if(c.c == area.c + area.w -1){
                                if(x >= gridSize - resizePadding && x <= gridSize){
                                    if(c.r == area.r && y >= 0 && y <= resizePadding){
                                        result.cursor = 'nesw-resize';
                                        result.resizeMode = 'ne';

                                    }
                                    else if(c.r == area.r + area.h -1 && y >= gridSize - resizePadding && y <= gridSize){
                                        result.cursor = 'nwse-resize';
                                        result.resizeMode = 'se';
                                    }
                                    else{
                                        result.cursor = 'ew-resize';
                                        result.resizeMode = 'e';
                                    }
                                    return result;
                                }
                            }
                        },function (c,area,x,y,gridSize) {
                            let result = {};
                            if(c.r == area.r){
                                if(y >=0 && y <= resizePadding){

                                    if(c.c == area.c && x >= 0 && x <= resizePadding){
                                        result.cursor = 'nwse-resize';
                                        result.resizeMode = 'nw';
                                    }
                                    else if(c.c == area.c + area.w -1 && x >= gridSize - resizePadding && x <= gridSize){
                                        result.cursor = 'nesw-resize';
                                        result.resizeMode = 'ne';
                                    }
                                    else {
                                        result.cursor = 'ns-resize';
                                        result.resizeMode = 'n';
                                    }
                                    return result;
                                }
                            }
                        },function (c,area,x,y,gridSize) {
                            let result = {};
                            if(c.r == area.r + area.h -1){
                                if(y >= gridSize - resizePadding && y <= gridSize){
                                    if(c.c == area.c && x >= 0 && x <= resizePadding){
                                        result.cursor = 'nesw-resize';
                                        result.resizeMode = 'sw';
                                    }
                                    else if(c.c == area.c + area.w -1 && x >= gridSize - resizePadding && x <= gridSize){
                                        result.cursor = 'nwse-resize';
                                        result.resizeMode = 'se';
                                    }
                                    else {
                                        result.cursor = 'ns-resize';
                                        result.resizeMode = 's';
                                    }
                                    return result;
                                }
                            }
                        });

   return {
       onMouseDown:function (evt,c) {
           const  me = this,data = me.data,areas = data.areas,gridData = data.gridData,box = data.draggingBox;
           let areaId = c.areaId;
           let area = areas.find(function (t) {
               return areaId == t.id;
           });
           area.active = true;
           box.status = "selected";
           let start = gridData[area.r - 1][area.c - 1];
           let end   = gridData[area.r + area.h - 2][area.c + area.w -2];

           if(me.activeArea){
               if(me.activeArea == area){
                   if(box.start != start){
                       box.start = start;
                       me.recalculateDraggingBox(end);
                   }

                   if(box.resizeMode){
                       me.currentState = me.states.resize;
                   }
                   else{
                       me.currentState = me.states.move;
                       me.currentState.onMouseDown.call(me,evt,c);
                   }
                   return;
               }
               me.activeArea.active = false;
           }
           box.start = start;
           me.recalculateDraggingBox(end);

           data.resizing = true;
           data.cursor = 'move';
           me.activeArea = area;

           me.currentState = me.states.move;
           me.currentState.onMouseDown.call(me,evt,c);
       },
       onMouseUp:function (evt,c) {},
       onMouseMove:function (evt,c) {
           const  me = this,area = me.activeArea,size = me.gridSize,x = evt.offsetX,y = evt.offsetY,box = me.data.draggingBox;
           if(c.areaId != area.id){
               me.data.cursor = 'default';
               return;
           }

           let cursor = "move";
           let resizeMode = null;

           for(let i = 0,n = resizeModeDecider.length; i < n; i ++){
               let result = resizeModeDecider[i](c,area,x,y,size);
               if(result){
                   cursor = result.cursor;
                   resizeMode = result.resizeMode;
                   break;
               }
           }

           box.resizeMode = resizeMode;
           me.data.cursor = cursor;

       },
       onDblClick : function (evt,c) {
           const  me = this,area = me.activeArea;
           if(area && area.id == c.areaId){
                me.onAreaDblClick(area);
           }
       },
       exit:function () {
           const  me = this,box = me.data.draggingBox,size = me.gridSize;
            if(me.activeArea){
                me.activeArea.active = false;
            }
            me.activeArea = null;
            me.data.resizing = false;
            me.data.cursor = 'default';
            box.w = box.h = size;
            box.status = "";
       }
   }
});