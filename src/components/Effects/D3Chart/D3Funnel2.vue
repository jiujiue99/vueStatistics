<style lang="less">
</style>

<template>
  <div class="funnel-chart" :id="chartId">
  </div>
</template>

<script>
  import { mapState } from 'Vuex';
  export default {
    data() {
      const chartId = '_funnel' +　Math.floor(Math.random() * 10000);
      const funnelColorList = ['#4965ac', '#54d1f5', '#ef873c', '#feca2d', '#f53234']
      const funnelHoverColorList = ['rgb(100, 129, 200)', 'rgb(135, 211, 249)', 'rgb(255, 167, 103)', 'rgb(255, 222, 123)', 'rgb(255, 106, 108)']
      return {
        // data: [20, 40, 60, 70, 100],
        data: [],
        funnelColorList,
        funnelHoverColorList,
        funnelLabelInfo: ['访问量', '点击量', '线索', '商机', '订单'],
        widthArr: [480, 384, 288, 192, 96],
        chartId,
        chartHeight: 400,
        chartWidth: 600,
        leftLinePos: 50,
        rightLinePos: 600,
        ploygonMargin: 6,
        funnelTopWidthRatio: 0.8,
        level: 5,
        polygonArr: [],
        linkedPolyIndex: [0, 1, 2, 3, 4],
        linkPolygonArr: [],
        svg: undefined
      }
    },
    methods: {
      drawFunnel() {
        const data = this.data.sort(this.descFn);

        const funnelTopWidth = this.chartWidth * this.funnelTopWidthRatio;
        const tubeHeight = this.chartHeight / this.level;

        this.svg = window.d3.select('#' + this.chartId)
              .append('svg');
        this.svg.attr('width', '100%').attr('height', '100%');

        var x = d3.scaleLinear().domain([0, d3.max(data)]).range([0, funnelTopWidth]);

        // const widthArr = data.map(d => Math.floor(x(d)));
        /*const widthArr = [480, 360, 240, 120, 60];
        console.log(widthArr);*/

        const Lines = this.widthArr.sort(this.descFn).map((width, index) => {
          let pointLeft = {x: this.chartWidth / 2 - width / 2, y: index * tubeHeight + 30};
          let pointRight = {x: this.chartWidth / 2 + width / 2, y: index * tubeHeight + 30};
          return {pointLeft, pointRight};
        });

        Lines.forEach((line, index) => {
          var bottomLine;
          if(index === Lines.length - 1){
            let bottomPoints = {
              x: this.chartWidth / 2,
              y: this.chartHeight + 30
            };
            bottomLine = {
              pointLeft: bottomPoints,
              pointRight: bottomPoints
            }
          }else{
            bottomLine = {
              pointLeft: Object.assign({}, Lines[index + 1].pointLeft),
              pointRight: Object.assign({}, Lines[index + 1].pointRight)
            }
          }
          bottomLine.pointLeft.y -= this.ploygonMargin;
          bottomLine.pointRight.y -= this.ploygonMargin;

          const rightLineRatio = (bottomLine.pointRight.y - line.pointRight.y) / (bottomLine.pointRight.x - line.pointRight.x)
          const B = line.pointRight.y - rightLineRatio * line.pointRight.x

          const fnY2X = y => {
            return (y - B) / rightLineRatio
          }
          const leftLineCenterPoint = {
            x: (line.pointLeft.x + bottomLine.pointLeft.x) / 2,
            y: (line.pointLeft.y + bottomLine.pointLeft.y) / 2
          }
          const rightLineUpPoint = {
            x: fnY2X((line.pointRight.y + bottomLine.pointRight.y) / 2 - 10),
            y: (line.pointRight.y + bottomLine.pointRight.y) / 2 - 10
          }
          const rightLineDownPoint = {
            x: fnY2X((line.pointRight.y + bottomLine.pointRight.y) / 2 + 10),
            y: (line.pointRight.y + bottomLine.pointRight.y) / 2 + 10
          }

          const ploygon = {
            pointLeftTop: line.pointLeft,
            pointRightTop: line.pointRight,
            pointLeftBottom: bottomLine.pointLeft,
            pointRightBottom: bottomLine.pointRight,
            color: this.funnelColorList[index],
            hoverColor: this.funnelHoverColorList[index],
            disabledColor: 'rgb(191, 203, 221)',
            disabled: false,
            /*color: '#' + Math.max(Math.floor(Math.random() * 1000000), 100000),
            hoverColor: '#' + Math.max(Math.floor(Math.random() * 1000000), 100000),
            disabledColor: '#' + Math.max(Math.floor(Math.random() * 1000000), 100000),*/
            leftLineCenterPoint,
            rightLineUpPoint,
            rightLineDownPoint,
            data: data[index],
            text: this.funnelLabelInfo[index]
          }
          this.polygonArr.push(ploygon)
        });

        const svg = this.svg;
        const hoverPolygon = this.hoverPolygon;

        const throttleMouseMove = _lodash.throttle(function(d, offsetX, offsetY) {
          const inHoverBg = svg.selectAll('.in-hover-text-bg').data([{
            polygon: d,
            offsetX,
            offsetY
          }])
          inHoverBg.exit().remove();
          inHoverBg.enter().append('polygon').attr('class', 'in-hover-text-bg');
          inHoverBg.attr('points', function(d) {
            const width = d.polygon.text.length * 15
            const points = [[offsetX + 10, offsetY - 30],
            [offsetX + 10 + width, offsetY - 30], 
            [offsetX + 10 + width, offsetY - 10],
            [offsetX + 10, offsetY - 10]]

            return points.reduce((pointsStr, nextPoint) => {
              return pointsStr + ' ' + nextPoint.join();
            }, '');
          }).style('fill', function(d){
            return '#fff';
          });

          const inHover = svg.selectAll('.in-hover-text').data([{
            polygon: d,
            offsetX,
            offsetY
          }])
          inHover.exit().remove();
          inHover.enter().append('text').attr('class', 'in-hover-text');
          inHover.attr('x', d => d.offsetX + 10).attr('y', d => d.offsetY - 15)
          .attr('background', d => '#fff').html(d => d.polygon.text);
        }, 40)

        const isPolygonDisabled = this.isPolygonDisabled;

        const res = this.svg.selectAll('polygon').data(this.polygonArr).enter().append('polygon').attr('points', function(d) {

          const points = [[d.pointLeftTop.x, d.pointLeftTop.y],
          [d.pointRightTop.x, d.pointRightTop.y], 
          [d.pointRightBottom.x, d.pointRightBottom.y],
          [d.pointLeftBottom.x, d.pointLeftBottom.y]]

          return points.reduce((pointsStr, nextPoint) => {
            return pointsStr + ' ' + nextPoint.join();
          }, '');
        }).style('fill', function(d, index){
          return isPolygonDisabled(index) ? d.disabledColor : d.color
        }).on('mouseover', function(d, index){
          if(isPolygonDisabled(index)){
            return
          }
          const {offsetX, offsetY} = d3.event;
          hoverPolygon(d)
          throttleMouseMove(d, offsetX, offsetY)
          this.style.fill = d.hoverColor
        }).on('mouseleave', function(d, index){
          if(isPolygonDisabled(index)){
            return
          }
          if(!d3.event.toElement || d3.event.toElement.nodeName === 'text'){
            return
          }
          const inHover = svg.selectAll('.in-hover-text').data([])
          inHover.exit().remove()
          const inHoverBg = svg.selectAll('.in-hover-text-bg').data([])
          inHoverBg.exit().remove()
          this.style.fill = d.color
        }).on('mousemove', function(d) {
          const {offsetX, offsetY} = d3.event;
          throttleMouseMove(d, offsetX, offsetY)
        }).on('click', (d, index) => {
          // this.polygonClicked(d, index);
        });
      },
      linkPolygon(indexArr){
        this.linkPolygonArr.length = 0;
        const sortedArr = indexArr.sort(this.ascFn)
        for(let i = 0; i < sortedArr.length - 1; i++) {
          this.linkBetween(sortedArr[i], sortedArr[i + 1])
        }
        this.drawLinkPolygon();
      },

      linkBetween (topIndex, bottomIndex) {
        const top = this.polygonArr[topIndex]
        const bottom = this.polygonArr[bottomIndex]
        const pointLeftTop = top.rightLineDownPoint
        const pointLeftBottom = bottom.rightLineUpPoint
        const pointRightTop = {
          x: this.leftLinePos,
          y: pointLeftTop.y
        }
        const pointRightBottom = {
          x: this.leftLinePos,
          y: pointLeftBottom.y
        }
        const textPoint = {
          x: this.rightLinePos - 60,
          y: (pointRightTop.y + pointRightBottom.y) / 2 + 6
        }
        
        const ploygon = {
          pointLeftTop,
          pointRightTop,
          pointLeftBottom,
          pointRightBottom,
          textPoint,
          top,
          bottom
        }
        this.linkPolygonArr.push(ploygon)
      },
      
      drawLinkPolygon() {
        this.svg.selectAll('.link-line-right').data([]).exit().remove();
        this.svg.selectAll('.link-line-right-text').data([]).exit().remove();

        const linked = this.svg.selectAll('.link-line-right').data(this.linkPolygonArr);
        const linkedText = this.svg.selectAll('.link-line-right-text').data(this.linkPolygonArr);
        
        const rightPos = this.rightLinePos;
        linked.enter().append('path').attr('class', 'link-line-right').attr('d', function(d){
          const polygonHeight = d.pointLeftBottom.y - d.pointLeftTop.y
          var str = `M${d.pointLeftTop.x} ${d.pointLeftTop.y} H ${rightPos} v ${polygonHeight/4} m 0,${polygonHeight/2} V ${d.pointRightBottom.y} H ${d.pointLeftBottom.x}`
          return str
        }).style('fill', 'white').style('stroke', 'rgb(99,99,99)').style('stroke-width', '2');

        linkedText.enter().append('text').attr('class', 'link-line-right-text').attr('x', function(d){
          return d.textPoint.x
        }).attr('y', function(d){
          return d.textPoint.y
        }).html(function(d){
          if(d.top.data === 0){
            return '0'
          }
          return `转化率: ${(d.bottom.data / d.top.data).toFixed(2) * 100}%`
        });
      },

      drawInfoText() {
        const innnerCenterTextPointArr = this.polygonArr.map(polygon => {
          return {
            x: (polygon.pointLeftTop.x + polygon.pointRightTop.x) / 2,
            y: (polygon.pointLeftTop.y + polygon.pointLeftBottom.y) / 2,
            text: polygon.text
          }
        });
        const centerText = this.svg.selectAll('.center-text').data(innnerCenterTextPointArr);
        centerText.exit().remove();
        centerText.enter().append('text').attr('class', 'center-text').attr('x', function(d){
          return d.x - 7 * d.text.length
        }).attr('y', function(d){
          return d.y
        }).style('stroke', function(){ return '#fff' })
        .html(function(d, index){
          return d.text
        }).on('click', (d, index) => {
          // this.polygonClicked(undefined, index);
        });
      },

      drawLeftLine() {
        const leftLinePos = this.leftLinePos;
        this.svg.selectAll('.left-line').data(this.polygonArr).enter()
        .append('line').attr('class', 'left-line')
        .attr('x1', function(d) {
          return d.leftLineCenterPoint.x
        }).attr('y1', function(d) {
          return d.leftLineCenterPoint.y
        }).attr('x2', function(d) {
          // return d.leftLineCenterPoint.x - 50
          return leftLinePos
        }).attr('y2', function(d) {
          return d.leftLineCenterPoint.y
        }).style('stroke', function(){
          return 'rgb(99,99,99)'
        }).style('stroke-width', function(){
          return '2'
        });
      },

      drawLeftLineText() {
        const leftLineTextPos = 8;
        this.svg.selectAll('.left-line-text').data(this.polygonArr).enter()
        .append('text').attr('class', 'left-line-text')
        .attr('x', function(d) {
          return leftLineTextPos
        }).attr('y', function(d) {
          return d.leftLineCenterPoint.y + 5
        }).html(function(d){
          return d.data
        });
      },

      hoverPolygon(polygon) {

      },

      drawLabelButton() {
        const svg = this.svg;
        const polygonClicked = this.polygonClicked;
        const funnelLabelInfo = this.funnelLabelInfo;
        const isPolygonDisabled = this.isPolygonDisabled;
        svg.selectAll('.label-button').data(this.polygonArr).enter()
        .append('path').attr('class', 'label-button')
        .attr('d', function(d, index){
          const width = 40
          const height = 30
          // const polygonHeight = d.pointLeftBottom.y - d.pointLeftTop.y
          var str = `M${index * 80 + 120} 470 h ${width} v ${height} h -${width} v -${height}`
          // var str = `M${index * 80 + 120} 430 C ${index * 80 + 140} 430 ${index * 80 + 160} 450`
          return str
        }).style('fill', function(d, index){ 
          return isPolygonDisabled(index) ? d.disabledColor : d.color
         })
        .style('stroke', function() { return '#000' })
          .on('mouseover', function(d, index){
          if(isPolygonDisabled(index)){
            return
          }
          this.style.fill = d.hoverColor
          svg.selectAll('polygon')._groups[0][index].style.fill = this.style.fill
        }).on('mouseleave', function(d, index){
          if(isPolygonDisabled(index)){
            return
          }
          this.style.fill = d.color
          svg.selectAll('polygon')._groups[0][index].style.fill = this.style.fill
        }).on('click', function(d, index) {
          const polyIndex = polygonClicked(d, index);
          if(polyIndex != -1){
            this.style.fill = d.disabledColor
          }else{
            this.style.fill = d.color
          }
        });
        
        svg.selectAll('.label-button-text').data(this.polygonArr).enter()
        .append('text').attr('class', 'label-button-text')
        .attr('x', function(d, index){
          if(funnelLabelInfo[index].length === 2){
            return index * 80 + 125
          }
          return index * 80 + 119
        }).attr('y', function(d, index){
          return 520
        }).html(function(d, index) {
          return funnelLabelInfo[index]
        });

      },

      polygonClicked(d, index) {
        const svg = this.svg;
        const polygonIndex = this.linkedPolyIndex.findIndex(lIndex => {
          return lIndex === index
        })
        if(polygonIndex != -1){
          this.linkedPolyIndex = this.linkedPolyIndex.filter(linked => {
            return linked != index
          })
          svg.selectAll('polygon')._groups[0][index].style.fill = d.disabledColor
        }else{
          this.linkedPolyIndex.push(index)
          svg.selectAll('polygon')._groups[0][index].style.fill = d.color
        }
        this.linkPolygon(this.linkedPolyIndex)
        return polygonIndex
      },

      isPolygonDisabled(index) {
        const polygonIndex = this.linkedPolyIndex.findIndex(lIndex => {
          return lIndex === index
        })
        return polygonIndex === -1
      },

      ascFn(a, b) {
        return a - b;
      },

      descFn(a, b) {
        return b - a;
      }
    },
    computed: {
      ...mapState(['statisticApi']),
    },
    mounted() {
      this.statisticApi.effects.getFunnelData(this.$route.params.id).then(res => {
        if(res.ok){
          return res.json()
        }
        return {error: true}
      }).then(resData => {
        console.log(resData)
        const newArr = []
        const { visit, hits, data, business, order } = resData
        this.data = _lodash.chain(newArr).push(visit).push(hits).push(data).push(business).push(order).value()
        this.drawFunnel();
        this.drawLeftLine();
        this.drawLeftLineText();
        this.drawInfoText();
        this.linkPolygon(this.linkedPolyIndex);
        this.drawLabelButton();
      }) 

    }
  }

</script>