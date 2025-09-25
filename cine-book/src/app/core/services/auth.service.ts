import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:5000/api';

  // --- BehaviorSubject stores user or admin state ---
  private loggedInUserSubject = new BehaviorSubject<any>(
    this.getStoredAccount()
  );
  loggedInUser$ = this.loggedInUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  // --- Storage helpers ---
  private getStoredUser() {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  }

  private getStoredAdmin() {
    try {
      return JSON.parse(localStorage.getItem('admin') || 'null');
    } catch {
      return null;
    }
  }

  private getStoredAccount() {
    return this.getStoredAdmin() || this.getStoredUser();
  }

  // --- API calls ---
  loginUser(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/user/login`, data).pipe(
      tap((res: any) => {
        if (res?.token) {
          localStorage.setItem('user', JSON.stringify(res));
          this.loggedInUserSubject.next({ ...res, role: 'user' });
        }
      })
    );
  }

  registerUser(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/user/register`, data).pipe(
      tap((res: any) => {
        if (res?.token) {
          localStorage.setItem('user', JSON.stringify(res));
          this.loggedInUserSubject.next({ ...res, role: 'user' });
        }
      })
    );
  }

  resetPassword(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/user/reset-password`, data);
  }

  // --- Admin login ---
  loginAdmin(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/login`, data).pipe(
      tap((res: any) => {
        if (res?.token) {
          localStorage.setItem('admin', JSON.stringify(res));
          this.loggedInUserSubject.next({ ...res, role: 'admin' });
        }
      })
    );
  }

  // --- Logout (works for both admin & user) ---
  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('admin');
    this.loggedInUserSubject.next(null);
  }

  // --- Token and login checks ---
  getToken(): string | null {
    const account = this.getStoredAccount();
    return account?.token || null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getUser() {
    return this.getStoredUser();
  }

  getAdmin() {
    return this.getStoredAdmin();
  }

  isAdminLoggedIn(): boolean {
    const admin = this.getStoredAdmin();
    return !!admin?.token;
  }

  // --- Role detection ---
  getUserRole(): string | null {
    if (this.getStoredAdmin()) return 'admin';
    if (this.getStoredUser()) return 'user';
    return null;
  }
}
