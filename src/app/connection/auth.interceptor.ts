import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import {catchError, Observable, throwError} from "rxjs";
import {TOKEN} from "../app.component";

export class AuthInterceptor implements HttpInterceptor {

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    const accessToken = localStorage.getItem(TOKEN);

    const authRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    console.log(authRequest);

    return next.handle(authRequest).pipe(
      catchError((err: any) => {
        if (err instanceof HttpErrorResponse) {
          // Handle HTTP errors
          if (err.status === 401) {
            // Specific handling for unauthorized errors
            console.error('Unauthorized request:', err);
            // You might trigger a re-authentication flow or redirect the user here
          } else {
            // Handle other HTTP error codes
            console.error('HTTP error:', err);
          }
        } else {
          // Handle non-HTTP errors
          console.error('An error occurred:', err);
        }

        // Re-throw the error to propagate it further
        return throwError(() => err);
      }))
  }


};
