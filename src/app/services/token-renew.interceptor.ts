import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { tap } from 'rxjs/operators';

export const tokenRenewInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    tap((event) => {
      if (event instanceof HttpResponse) {
        const newToken = event.headers.get('X-New-Token');
        if (newToken) {
          // Update the stored token with the new one
          localStorage.removeItem('token');
          localStorage.setItem('token', newToken);

        }
      }
    })  
  );
};
