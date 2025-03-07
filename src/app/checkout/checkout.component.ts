import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

declare var paypal: any; // 引入 PayPal SDK


@Component({
  selector: 'app-checkout',
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent implements AfterViewInit {
  cartItems: any[] = [];
  totalPrice: number = 0;
  customer = { name: '', phone: '', address: '' };
  orderSuccess: boolean = false;
  user_id: number | null = null; // 當前用戶 ID


  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit() {
    this.loadUser();
    this.loadCart();  }

  ngAfterViewInit() {
    this.loadPayPal();
  }

  // 📌 讀取購物車
  loadCart() {
    this.cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
    this.totalPrice = this.cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  // 📌 讀取當前登入的用戶
loadUser() {
  const userData = JSON.parse(localStorage.getItem('user') || '{}');
  if (userData && userData.id) {
    this.user_id = userData.id;
  } else {
    alert("⚠️ 請先登入帳號再進行結帳！");
    this.router.navigate(['/login']); // 🔄 如果未登入，跳轉到登入頁面
  }
}

  // 📌 PayPal 支付功能
  // loadPayPal() {
  //   paypal.Buttons({
  //     createOrder: (data: any, actions: any) => {
  //       // 📌 付款前檢查用戶是否填寫完整的收件資訊
  //       if (!this.customer.name || !this.customer.phone || !this.customer.address) {
  //         alert('❗ 請填寫完整的收件資訊再付款！');
  //         return actions.reject();
  //       }
        
  //       return actions.order.create({
  //         purchase_units: [{
  //           amount: { value: this.totalPrice.toFixed(2) }
  //         }]
  //       });
  //     },
  //     onApprove: (data: any, actions: any) => {
  //       return actions.order.capture().then((details: any) => {
  //         console.log('✅ 付款成功：', details);
  //         this.completeOrder(details);
  //       });
  //     },
  //     onError: (err: any) => {
  //       console.error('❌ 付款失敗：', err);
  //       alert('付款過程中出現錯誤，請稍後再試！');
  //     }
  //   }).render('#paypal-button-container');
  // }

  loadPayPal() {
    paypal.Buttons({
      locale: 'zh_TW', // ✅ 強制使用繁體中文
      createOrder: (data: any, actions: any) => {
        if (!this.customer.name || !this.customer.phone || !this.customer.address) {
          alert('❗ 請填寫完整的收件資訊再付款！');
          return actions.reject();
        }
  
        return actions.order.create({
          purchase_units: [{
            amount: { value: this.totalPrice.toFixed(2) }
          }]
        });
      },
      onApprove: (data: any, actions: any) => {
        return actions.order.capture().then((details: any) => {
          console.log('✅ 付款成功（Sandbox 模式）：', details);
          this.completeOrder(details);
        });
      },
      onError: (err: any) => {
        console.error('❌ 付款失敗：', err);
        alert('付款過程中出現錯誤，請稍後再試！');
      }
    }).render('#paypal-button-container');
  }
  
  // 📌 付款成功後執行
  completeOrder(paymentId: string) {
    const orderData = {
      user_id: this.user_id,
      cartItems: this.cartItems,
      total_amount: this.totalPrice,
      payment_id: paymentId
    };

    this.http.post('http://localhost/IT-Project/Project2/checkout.php', orderData).subscribe((response: any) => {
      if (response.success) {
        console.log('✅ 訂單已成功提交！', response);

        // ✅ 清空購物車
        localStorage.removeItem('cart');

        // 🎉 顯示「訂單成功」
        this.orderSuccess = true;

        // 3 秒後跳轉到訂單頁面
        setTimeout(() => {
          this.router.navigate(['/orders']);
        }, 3000);
      } else {
        alert('❌ 提交訂單失敗！請稍後再試！');
      }
    }, error => {
      console.error('❌ 提交訂單 API 錯誤：', error);
      alert('伺服器錯誤，請稍後再試！');
    });
  }
}