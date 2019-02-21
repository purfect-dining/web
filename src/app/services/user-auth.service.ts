import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "src/environments/environment";
import { UserModel } from "src/app/models/user-model";
import { Subject, Observable } from "rxjs";

//backend api url for communication (Port 3000)
// const BACKEND_URL = environment.apiUrl + "/user/";
const BACKEND_URL = environment.apiUrl + "/user";

@Injectable({
  providedIn: "root"
})
export class UserAuthService {
  private userToken: string;
  private userId: string;
  private isAuthenticated: boolean;
  private authStatusListener = new Subject<string>(); //help with emit messages
  private emailSignUp: string; //email when the user sign up successfully, use when resend confirmation needed
  private currentUserEmail: string; // the current email of the user (when logged in)
  private currentUserPassword: string; // the current email of the user (when logged in)

  constructor(private http: HttpClient) {}

  createUser(email: string, password: string) {
    var UserModel: UserModel = {
      email: email,
      password: password
    };
    //send User info to the backend server
    this.http
      .post<{ message: string }>(BACKEND_URL + "/signup", UserModel)
      .subscribe(
        response => {
          console.log(response.message);
          this.authStatusListener.next("success");
          //if user create account successfully, save that email
          //to resend confirmation if needed
          this.emailSignUp = email;
        },
        error => {
          console.log(error.error.message);
          this.authStatusListener.next(error.error.message);
        }
      );
  }

  resendConfirmation() {
    //send email to the backend server
    this.http
      .post<{ message: string }>(BACKEND_URL + "/resend", {
        email: this.emailSignUp
      })
      .subscribe(
        response => {
          console.log(response.message);
        },
        error => {
          console.log(error.error.message);
        }
      );
  }

  signIn(email: string, password: string) {
    var UserModel: UserModel = {
      email: email,
      password: password
    };
    //send user info to log in
    this.http
      .post<{ userToken: string; userId: string }>(
        BACKEND_URL + "/login",
        UserModel
      )
      .subscribe(
        response => {
          //save user token and id
          this.userToken = response.userToken;
          this.userId = response.userId;
          this.isAuthenticated = true;
          console.log("User has logged in succesfully");
          //TODO add new route when user successfully log in
          this.currentUserEmail = email;
          this.currentUserPassword = password;
        },
        error => {
          console.log(error.error.message);
          this.authStatusListener.next(error.error.message);
        }
      );
  }

  recoveryPassword(email: string) {
    //send email to backend server for recovery password
    this.http.post(BACKEND_URL + "/recovery", { email: email }).subscribe(
      () => {
        this.authStatusListener.next("success");
      },
      error => {
        console.log(error.error.message);
        this.authStatusListener.next(error.error.message);
      }
    );
  }


  changeUserEmail(newemail: string){
    // change email
    console.log("This is the entered email: " + newemail);
    this.http.post(BACKEND_URL + "/modifyemail", {email: newemail}).subscribe(
      () => {
        this.authStatusListener.next('Esuccess');
      },
      error => {
        console.log(error.error.message);
        this.authStatusListener.next(error.error.message);
      }
    );
  }

  changeUserPassword(newpassword: string){
    // change password
    console.log("This is the new entered password: " + newpassword);
    this.http.post(BACKEND_URL + "/modifypassword", {email: newpassword}).subscribe(
      () => {
        this.authStatusListener.next('Psuccess');
      },
      error => {
        console.log(error.error.message);
        this.authStatusListener.next(error.error.message);
      }
    );
  }

  getUserId(): string {
    return this.userId;
  }
  getUserToken(): string {
    return this.userToken;
  }
  isUserAuthenticated(): boolean {
    return this.isAuthenticated;
  }
  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }
}
