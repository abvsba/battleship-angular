import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {first, Observable, tap} from 'rxjs';

import {User} from "../../shared/models/user.model";
import {JwtHelperService} from "@auth0/angular-jwt";
import {Router} from "@angular/router";
import {GameDetails} from "../../shared/models/gameDetails.model";

@Injectable({
  providedIn: 'root',
})
export class UserRestService {
  private BASE_URL = 'http://localhost:3000/users';
  private user : User | undefined;

  constructor(private http: HttpClient, private router : Router) {}

  login(username: string, password: string): Observable<User> {

    return this.http.post<User>(this.BASE_URL + '/login', {username, password}).pipe(
      first(),
      tap((jsonToken: any) => {
        const jwtHelper = new JwtHelperService();
        this.user = jsonToken;
        this.user!.id = jwtHelper.decodeToken(jsonToken.token).id;
        this.user!.username = jwtHelper.decodeToken(jsonToken.token).username;
        this.user!.email = jwtHelper.decodeToken(jsonToken.token).email;
      })
    );
  }

  patchPassword(oldPassword: string, newPassword : string) {
    return this.http.patch(this.BASE_URL + '/' + this.user!.id + '/password',
      { oldPassword : oldPassword, newPassword : newPassword });
  }

  register(user : User): Observable<User> {
    return this.http.post<User>(this.BASE_URL + '/signup', user);
  }

  getUserDDBB(username: string) {
    return this.http.get(this.BASE_URL + '/' + username);
  }

  logout() {
    this.user = undefined;
    this.router.navigate(['']).then();
  }

  deleteUser(userid : number) {
    return this.http.delete(this.BASE_URL + '/' + userid);
  }

  saveGameDetail(gameDetails : GameDetails) {
    return this.http.post(this.BASE_URL + '/' + this.user!.id + '/histories', gameDetails);
  }

  getGameHistory() {
    return this.http.get<GameDetails[]>(this.BASE_URL + '/' + this.user!.id + '/histories');
  }

  getToken(): string | undefined{
    return this.user?.token;
  }

  getUser(): User {
    return this.user!;
  }

  isAuthenticated(): boolean {
    return this.user != null && !(new JwtHelperService().isTokenExpired(this.user.token));
  }
}
