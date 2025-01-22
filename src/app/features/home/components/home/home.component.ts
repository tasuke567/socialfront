import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { PostsComponent } from '../../../../components/posts/posts/posts.component';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [PostsComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  title = 'Welcome to Our Social Network!';
  subtitle = 'Connecting the world, one friend at a time.';
  constructor(private router: Router) {}
  navigateToLogin() {
    this.router.navigate(['/login']); // นำทางไปยังหน้า login
  }
}
