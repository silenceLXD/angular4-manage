import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'searchBykey'
})


export class SearchBykeyPipe implements PipeTransform {
  transform(list: any[], filterField: string, keyword: string): any {
    // filterField是告诉是要根据商品的标题进行过滤还是价格。。。。
    // keyword就是搜索框中输入的东西
    // 如果没有传进来
    if (list) {
      if (!filterField || !('' + keyword)) {
        return list;
      }
      return list.filter(item => {
        const fieldValue = item[filterField];
        return +fieldValue === +keyword;
        // return fieldValue.indexOf(keyword)>=0;
      });
    } else {
      return;
    }


  }

}
