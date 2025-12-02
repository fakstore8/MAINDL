let cart = [];
let orderData = {};
let uploadedFile = null;
let uploadedSellFile = null;

function addToCart(packageName, price) {
    cart.push({ name: packageName, price: price });
    updateCart();
    document.getElementById('cartSection').style.display = 'block';
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCart();
    if (cart.length === 0) {
        document.getElementById('cartSection').style.display = 'none';
    }
}

function updateCart() {
    const cartItems = document.getElementById('cartItems');
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    
    cartItems.innerHTML = cart.map((item, index) => `
        <div class="cart-item">
            <span>${item.name} - Rp ${item.price.toLocaleString('id-ID')}</span>
            <button class="remove-btn" onclick="removeFromCart(${index})">Hapus</button>
        </div>
    `).join('');
    
    document.getElementById('totalPrice').textContent = total.toLocaleString('id-ID');
}

function goToCheckout() {
    if (cart.length === 0) {
        alert('Keranjang kosong! Pilih paket terlebih dahulu.');
        return;
    }

    const checkoutItems = document.getElementById('checkoutCartItems');
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    
    checkoutItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <span>${item.name}</span>
            <span>Rp ${item.price.toLocaleString('id-ID')}</span>
        </div>
    `).join('');
    
    document.getElementById('checkoutTotal').textContent = total.toLocaleString('id-ID');
    goToPage('checkoutPage');
}

function goToPayment() {
    const growId = document.getElementById('growId').value;
    const worldInfo = document.getElementById('worldInfo').value;
    const phoneNumber = document.getElementById('phoneNumber').value;
    
    if (!growId || !worldInfo || !phoneNumber) {
        alert('⚠️ Mohon lengkapi semua data yang wajib diisi!');
        return;
    }

    orderData = {
        growId: growId,
        worldInfo: worldInfo,
        phoneNumber: phoneNumber,
        notes: document.getElementById('notes').value,
        packages: cart,
        total: cart.reduce((sum, item) => sum + item.price, 0)
    };

    document.getElementById('paymentTotal').textContent = orderData.total.toLocaleString('id-ID');
    goToPage('paymentPage');
}

function previewFile() {
    const fileInput = document.getElementById('proofFile');
    const preview = document.getElementById('filePreview');
    
    if (fileInput.files && fileInput.files[0]) {
        uploadedFile = fileInput.files[0];
        const reader = new FileReader();
        
        reader.onload = function(e) {
            preview.style.display = 'block';
            preview.innerHTML = `
                <div class="file-info">✅ File terpilih: ${uploadedFile.name}</div>
                <img src="${e.target.result}" alt="Preview Bukti Pembayaran">
            `;
        };
        
        reader.readAsDataURL(uploadedFile);
    }
}

function sendToWhatsApp() {
    const fileInput = document.getElementById('proofFile');
    
    if (!fileInput.files || fileInput.files.length === 0) {
        alert('⚠️ Mohon upload bukti pembayaran terlebih dahulu!');
        return;
    }

    // Send to Discord first
    sendToDiscord('buy', orderData, uploadedFile).then(() => {
        const packageList = orderData.packages.map(p => p.name).join('\n');
        const message = `🎮 *PESANAN DL/BGL GROWTOPIA*

👤 *DATA PEMBELI:*
GrowID: ${orderData.growId}
World: ${orderData.worldInfo}
No. WhatsApp: ${orderData.phoneNumber}

💎 *PESANAN:*
${packageList}

💰 *TOTAL PEMBAYARAN:*
Rp ${orderData.total.toLocaleString('id-ID')}

${orderData.notes ? '📝 *CATATAN:*\n' + orderData.notes + '\n\n' : ''}
✅ Bukti pembayaran sudah dikirim ke Discord
📤 Mohon segera diproses

Terima kasih! 🙏`;

        const waUrl = `https://wa.me/6285737668457?text=${encodeURIComponent(message)}`;
        window.open(waUrl, '_blank');
        
        setTimeout(() => {
            alert('✅ Pesanan berhasil dikirim!\n\n📱 WhatsApp: Pesan sudah disiapkan\n💬 Discord: Bukti pembayaran sudah terkirim otomatis\n\nSilahkan kirim pesan WhatsApp yang sudah terbuka!');
        }, 500);
        
        goToPage('successPage');
    }).catch(err => {
        alert('❌ Gagal mengirim ke Discord. Silahkan coba lagi atau hubungi admin.\n\nError: ' + err.message);
    });
}

function goToSellPage() {
    goToPage('sellPage');
}

function calculateSellTotal() {
    const dlAmount = parseInt(document.getElementById('sellDLAmount').value) || 0;
    const bglAmount = parseInt(document.getElementById('sellBGLAmount').value) || 0;
    
    const dlTotal = dlAmount * 400;
    const bglTotal = bglAmount * 40000;
    const total = dlTotal + bglTotal;
    
    document.getElementById('sellTotal').value = total > 0 ? 'Rp ' + total.toLocaleString('id-ID') : '';
}

function previewSellFile() {
    const fileInput = document.getElementById('sellProofFile');
    const preview = document.getElementById('sellFilePreview');
    
    if (fileInput.files && fileInput.files[0]) {
        uploadedSellFile = fileInput.files[0];
        const reader = new FileReader();
        
        reader.onload = function(e) {
            preview.style.display = 'block';
            preview.innerHTML = `
                <div class="file-info">✅ File terpilih: ${uploadedSellFile.name}</div>
                <img src="${e.target.result}" alt="Preview Bukti Drop">
            `;
        };
        
        reader.readAsDataURL(uploadedSellFile);
    }
}

function sendSellToWhatsApp() {
    const sellGrowId = document.getElementById('sellGrowId').value;
    const dlAmount = parseInt(document.getElementById('sellDLAmount').value) || 0;
    const bglAmount = parseInt(document.getElementById('sellBGLAmount').value) || 0;
    const sellTotal = document.getElementById('sellTotal').value;
    const sellPhone = document.getElementById('sellPhone').value;
    const fileInput = document.getElementById('sellProofFile');
    
    if (!sellGrowId || !sellPhone) {
        alert('⚠️ Mohon lengkapi GrowID dan Nomor WhatsApp/DANA!');
        return;
    }

    if (dlAmount === 0 && bglAmount === 0) {
        alert('⚠️ Mohon isi jumlah DL atau BGL yang dijual!');
        return;
    }

    if (!fileInput.files || fileInput.files.length === 0) {
        alert('⚠️ Mohon upload bukti screenshot drop terlebih dahulu!');
        return;
    }

    let itemList = '';
    if (dlAmount > 0) itemList += `${dlAmount} DL\n`;
    if (bglAmount > 0) itemList += `${bglAmount} BGL`;

    const sellData = {
        growId: sellGrowId,
        dlAmount: dlAmount,
        bglAmount: bglAmount,
        total: sellTotal,
        phone: sellPhone,
        notes: document.getElementById('sellNotes').value
    };

    // Send to Discord first
    sendToDiscord('sell', sellData, uploadedSellFile).then(() => {
        const sellNotes = document.getElementById('sellNotes').value;
        const message = `💸 *JUAL DL/BGL KE MAIN.ID*

👤 *DATA PENJUAL:*
GrowID: ${sellGrowId}
No. WhatsApp/DANA: ${sellPhone}

💎 *YANG DIJUAL:*
${itemList}

📍 *DROP DI WORLD:*
FAKSTORESV

💰 *TOTAL PEMBAYARAN:*
${sellTotal}

${sellNotes ? '📝 *CATATAN:*\n' + sellNotes + '\n\n' : ''}
✅ Bukti screenshot drop sudah dikirim ke Discord
💸 Mohon segera ditransfer

Terima kasih! 🙏`;

        const waUrl = `https://wa.me/6285737668457?text=${encodeURIComponent(message)}`;
        window.open(waUrl, '_blank');
        
        setTimeout(() => {
            alert('✅ Pesanan berhasil dikirim!\n\n📱 WhatsApp: Pesan sudah disiapkan\n💬 Discord: Bukti drop sudah terkirim otomatis\n\nSilahkan kirim pesan WhatsApp yang sudah terbuka!');
        }, 500);
        
        // Reset form
        document.getElementById('sellGrowId').value = '';
        document.getElementById('sellDLAmount').value = '';
        document.getElementById('sellBGLAmount').value = '';
        document.getElementById('sellTotal').value = '';
        document.getElementById('sellPhone').value = '';
        document.getElementById('sellNotes').value = '';
        document.getElementById('sellProofFile').value = '';
        document.getElementById('sellFilePreview').style.display = 'none';
        uploadedSellFile = null;
        
        goToPage('successPage');
    }).catch(err => {
        alert('❌ Gagal mengirim ke Discord. Silahkan coba lagi atau hubungi admin.\n\nError: ' + err.message);
    });
}

function goToPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
    window.scrollTo(0, 0);
}

function resetAndGoHome() {
    cart = [];
    orderData = {};
    uploadedFile = null;
    document.getElementById('growId').value = '';
    document.getElementById('worldInfo').value = '';
    document.getElementById('phoneNumber').value = '';
    document.getElementById('notes').value = '';
    document.getElementById('proofFile').value = '';
    document.getElementById('filePreview').style.display = 'none';
    document.getElementById('cartSection').style.display = 'none';
    goToPage('homepage');
}

// Discord Integration
async function sendToDiscord(type, data, file) {
    const webhookUrl = type === 'buy' 
        ? document.getElementById('discordWebhookPayment').value 
        : document.getElementById('discordWebhookDrop').value;
    
    if (!webhookUrl || webhookUrl.includes('PASTE_YOUR')) {
        throw new Error('Discord Webhook belum dikonfigurasi!');
    }

    // Convert file to base64
    const base64 = await fileToBase64(file);
    
    let embed;
    if (type === 'buy') {
        const packageList = data.packages.map(p => p.name).join('\n');
        embed = {
            title: "🎮 PESANAN BARU - BELI DL/BGL",
            color: 3447003, // Blue
            fields: [
                { name: "👤 GrowID", value: data.growId, inline: true },
                { name: "🌍 World", value: data.worldInfo, inline: true },
                { name: "📱 WhatsApp", value: data.phoneNumber, inline: true },
                { name: "💎 Pesanan", value: packageList, inline: false },
                { name: "💰 Total", value: `Rp ${data.total.toLocaleString('id-ID')}`, inline: false }
            ],
            timestamp: new Date().toISOString(),
            footer: { text: "MAIN.ID - Pesanan Beli" }
        };
        if (data.notes) {
            embed.fields.push({ name: "📝 Catatan", value: data.notes, inline: false });
        }
    } else {
        let itemList = '';
        if (data.dlAmount > 0) itemList += `${data.dlAmount} DL`;
        if (data.bglAmount > 0) {
            if (itemList) itemList += '\n';
            itemList += `${data.bglAmount} BGL`;
        }
        
        embed = {
            title: "💸 PESANAN BARU - JUAL DL/BGL",
            color: 5763719, // Green
            fields: [
                { name: "👤 GrowID", value: data.growId, inline: true },
                { name: "📱 WhatsApp/DANA", value: data.phone, inline: true },
                { name: "📍 World Drop", value: "FAKSTORESV", inline: true },
                { name: "💎 Yang Dijual", value: itemList, inline: false },
                { name: "💰 Transfer ke Seller", value: data.total, inline: false }
            ],
            timestamp: new Date().toISOString(),
            footer: { text: "MAIN.ID - Pesanan Jual" }
        };
        if (data.notes) {
            embed.fields.push({ name: "📝 Catatan", value: data.notes, inline: false });
        }
    }

    // Send message with embed
    const payload = {
        embeds: [embed]
    };

    // Send first message with details
    await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    // Send image as attachment
    const blob = await fetch(base64).then(r => r.blob());
    const formData = new FormData();
    formData.append('file', blob, file.name);
    
    const imagePayload = {
        content: type === 'buy' ? '📸 **BUKTI PEMBAYARAN:**' : '📸 **BUKTI DROP:**'
    };
    formData.append('payload_json', JSON.stringify(imagePayload));

    await fetch(webhookUrl, {
        method: 'POST',
        body: formData
    });
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}