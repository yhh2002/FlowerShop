import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../product.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';


@Component({
  selector: 'app-product-detail',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css'
})
export class ProductDetailComponent {
  product: any = null;
  quantity: number = 1;
  cartMessage: string = '';

  constructor(private route: ActivatedRoute, private productService: ProductService) {}

  ngOnInit() {
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      this.productService.getProductById(productId).subscribe(
        (data) => {
          if (data?.header?.success && data.data.length > 0) {
            this.product = data.data[0];
          } else {
            console.error("API 回傳無效產品資料:", data);
            this.product = null; // ✅ 如果 API 無效，確保不會報錯
          }
        },
        (error) => {
          console.error("載入產品時發生錯誤:", error);
          this.product = null;
        }
      );
    }
  }

  addToCart() {
    if (this.quantity < 1) {
      this.cartMessage = "請選擇至少 1 件商品！";
      return;
    }

    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    let existingItem = cart.find((item: any) => item.id === this.product.id);

    if (existingItem) {
      existingItem.quantity += this.quantity;
    } else {
      cart.push({
        id: this.product.id,
        name: this.product.name,
        price: this.product.price,
        quantity: this.quantity,
        image_url: this.product.image_url,
      });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    this.cartMessage = "✅ 產品已成功加入購物車！";
  }
}