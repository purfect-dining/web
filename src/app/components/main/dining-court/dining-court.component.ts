import { Component, OnInit, OnDestroy } from "@angular/core";
import { UserAuthService } from "src/app/services/user-auth.service";
import { DiningService } from "src/app/services/dining.service";

import { Subscription } from "rxjs";
import { Comment } from "src/app/models/comment";
import { NgForm } from "@angular/forms";
import { ActivatedRoute, ParamMap } from "@angular/router";
@Component({
  selector: "app-dining-court",
  templateUrl: "./dining-court.component.html",
  styleUrls: ["./dining-court.component.css"]
})
export class DiningCourtComponent implements OnInit, OnDestroy {
  commentList: Comment[];
  loggedIn = false;
  ifDeleted = false;
  userId: string = "";
  count = 0;
  private authStatusSub: Subscription;
  private diningListener: Subscription;
  private diningName: string; //diningName param for UI
  private diningNameBackend: string; //diningName param for backend to understand

  constructor(
    private userAuthService: UserAuthService,
    private diningService: DiningService,
    private route: ActivatedRoute
  ) {
    this.userAuthService.checkIfUserLoggedIn();
  }

  ngOnInit() {
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      //check if contain diningName in the param route
      if (paramMap.has("diningName")) {
        this.authStatusSub = this.userAuthService
          .getAuthStatusListener()
          .subscribe(message => {
            console.log(message);
            if (message === "loggedinsuccess") {
              this.loggedIn = true;
              this.userId = this.userAuthService.getUserId();
            } else {
              this.loggedIn = false;
            }
          });
        //get diningName from the param route
        this.diningName = paramMap.get("diningName");

        //convert some diningName so backend can understand
        if (this.diningName === "1bowl") {
          this.diningNameBackend = "onebowl";
        } else if (this.diningName === "pete's za") {
          this.diningNameBackend = "peteza";
        } else {
          this.diningNameBackend = this.diningName;
        }
        //Showing all the comments
        this.diningListener = this.diningService
          .getDiningCourtEmitter()
          .subscribe(respond => {
            this.commentList = respond;
          });
        this.diningService.getComment(this.diningNameBackend);
      }
    });
  }
  ngOnDestroy() {
    this.diningListener.unsubscribe();
    this.authStatusSub.unsubscribe();
  }
  postComment(form: NgForm) {
    var inputComment = form.value.comment;
    this.diningService.postComment(inputComment, this.diningNameBackend);
  }
  deleteComment(commentId: string) {
    this.diningService.removeComment(commentId);
  }
}