import { of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { ajax } from 'rxjs/ajax';
import { XMLHttpRequest } from 'xmlhttprequest'

function createXHR() {
  return new XMLHttpRequest();
}

let users = of(3,2,1);

let result = users.pipe(mergeMap((user) => ajax({
    createXHR,
    url:`https://api.github.com/users?per_page=${user}`,
    crossDomain: false,
})));

result.subscribe((resp)=> console.log(JSON.stringify(resp)),(err)=> console.log(err));