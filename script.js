document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const sidebarMenu = document.getElementById('sidebarMenu');
    const logoutSection = document.getElementById('logoutSection');
    const logoutBtn = document.getElementById('logoutBtn');
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const sidebar = document.querySelector('.sidebar');

    // Toggle Sidebar on Hamburger Click
    if (hamburgerMenu && sidebar) {
        hamburgerMenu.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });

        // Close Sidebar When Clicking a Menu Item (Mobile)
        const sidebarLinks = document.querySelectorAll('.sidebar a');
        sidebarLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    sidebar.classList.remove('active');
                }
            });
        });
    }

    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    // Sidebar menu items
    const customerMenu = `
        <li><a href="index.html" class="${window.location.pathname.includes('index.html') ? 'active' : ''}"><span class="icon">🏡</span><span class="text">Home</span></a></li>
        <li><a href="packages.html" class="${window.location.pathname.includes('packages.html') ? 'active' : ''}"><span class="icon">🎁</span><span class="text">Packages</span></a></li>
        <li><a href="booking.html" class="${window.location.pathname.includes('booking.html') ? 'active' : ''}"><span class="icon">📅</span><span class="text">Booking</span></a></li>
    `;

    const adminMenu = `
        <li><a href="index.html" class="${window.location.pathname.includes('index.html') ? 'active' : ''}"><span class="icon">🏡</span><span class="text">Home</span></a></li>
        <li><a href="packages.html" class="${window.location.pathname.includes('packages.html') ? 'active' : ''}"><span class="icon">🎁</span><span class="text">Packages</span></a></li>
        <li><a href="booking.html" class="${window.location.pathname.includes('booking.html') ? 'active' : ''}"><span class="icon">📅</span><span class="text">Booking</span></a></li>
        <li><a href="profile.html" class="${window.location.pathname.includes('profile.html') ? 'active' : ''}"><span class="icon">👤</span><span class="text">Profile</span></a></li>
        <li><a href="sales.html" class="${window.location.pathname.includes('sales.html') ? 'active' : ''}"><span class="icon">💰</span><span class="text">Sales</span></a></li>
    `;

    // Access Control: Redirect to index.html if not logged in and trying to access restricted pages
    const restrictedPages = ['profile.html', 'sales.html'];
    if (!isLoggedIn && restrictedPages.some(page => window.location.pathname.includes(page))) {
        window.location.href = 'index.html';
    }

    // Populate sidebar based on login status
    if (sidebarMenu) {
        sidebarMenu.innerHTML = isLoggedIn ? adminMenu : customerMenu;
    }

    // Show/Hide logout button based on login status
    if (logoutSection) {
        logoutSection.style.display = isLoggedIn ? 'block' : 'none';
    }

    // Logout functionality
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('isLoggedIn');
            alert('Logged out successfully!');
            window.location.href = 'index.html';
        });
    }

    // Admin Login
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            if (username === 'admin' && password === 'password123') {
                localStorage.setItem('isLoggedIn', 'true');
                alert('Login Successful!');
                window.location.href = 'index.html';
            } else {
                alert('Invalid username or password!');
            }
        });
    }

    // Packages Page: Show image on package click
    const packageList = document.getElementById('packageList');
    const packageImage = document.getElementById('packageImage');

    if (packageList && packageImage) {
        packageList.addEventListener('click', (e) => {
            if (e.target.tagName === 'LI') {
                const imageSrc = e.target.getAttribute('data-image');
                packageImage.innerHTML = `<img src="${imageSrc}" alt="Package Image">`;
            }
        });
    }

    // Booking Page: Auto-fill amount based on package selection
    const packageSelect = document.getElementById('package');
    const amountInput = document.getElementById('amount');

    if (packageSelect && amountInput) {
        packageSelect.addEventListener('change', () => {
            const selectedOption = packageSelect.options[packageSelect.selectedIndex];
            const price = selectedOption.getAttribute('data-price');
            amountInput.value = `₹${price}`;
        });

        // Set initial amount on page load
        const initialPrice = packageSelect.options[packageSelect.selectedIndex].getAttribute('data-price');
        amountInput.value = `₹${initialPrice}`;
    }

    // Booking Form Submission with API Call to Backend
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const customerName = document.getElementById('customerName').value;
            const contactNumber = document.getElementById('contactNumber').value;
            const eventDate = document.getElementById('eventDate').value;
            const eventTime = document.getElementById('eventTime').value;
            const branch = document.getElementById('branch').value;
            const selectedPackage = document.getElementById('package').value;
            const amount = document.getElementById('amount').value;

            const uniqueId = 'BOOK-' + Date.now() + '-' + Math.floor(Math.random() * 1000);

            const bookingDetails = {
                uniqueId,
                customerName,
                contactNumber,
                eventDate,
                eventTime,
                branch,
                selectedPackage,
                amount
            };

            try {
                const response = await fetch('http://localhost:5000/api/bookings', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(bookingDetails)
                });
                const result = await response.json();
                if (response.ok) {
                    alert('Booking Successful! Your Booking ID: ' + result.bookingId);
                    bookingForm.reset();
                    amountInput.value = `₹${packageSelect.options[0].getAttribute('data-price')}`;
                } else {
                    alert('Error creating booking: ' + result.error);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Error creating booking');
            }
        });
    }

    // Profile Page: Fetch and Delete Bookings from Backend
    const toggleCustomers = document.getElementById('toggleCustomers');
    const customerList = document.getElementById('customerList');

    if (toggleCustomers && customerList) {
        toggleCustomers.addEventListener('click', async () => {
            if (customerList.style.display === 'block') {
                customerList.style.display = 'none';
            } else {
                customerList.style.display = 'block';
                try {
                    const response = await fetch('http://localhost:5000/api/bookings');
                    const bookings = await response.json();
                    customerList.innerHTML = bookings.map(booking => `
                        <div class="customer-profile">
                            <p><strong>Booking ID:</strong> ${booking.uniqueId}</p>
                            <p><strong>Name:</strong> ${booking.customerName}</p>
                            <p><strong>Contact:</strong> ${booking.contactNumber}</p>
                            <p><strong>Event Date:</strong> ${booking.eventDate}</p>
                            <p><strong>Event Time:</strong> ${booking.eventTime || 'Not specified'}</p>
                            <p><strong>Branch:</strong> ${booking.branch || 'Not specified'}</p>
                            <p><strong>Package:</strong> ${booking.selectedPackage}</p>
                            <p><strong>Amount:</strong> ${booking.amount}</p>
                            <button class="delete-btn" data-id="${booking.id}">Delete</button>
                        </div>
                    `).join('');

                    const deleteButtons = document.querySelectorAll('.delete-btn');
                    deleteButtons.forEach(button => {
                        button.addEventListener('click', async (e) => {
                            const id = e.target.getAttribute('data-id');
                            try {
                                const response = await fetch(`http://localhost:5000/api/bookings/${id}`, {
                                    method: 'DELETE'
                                });
                                const result = await response.json();
                                if (response.ok) {
                                    alert('Booking Deleted!');
                                    e.target.parentElement.remove();
                                } else {
                                    alert('Error deleting booking: ' + result.error);
                                }
                            } catch (error) {
                                console.error('Error:', error);
                                alert('Error deleting booking');
                            }
                        });
                    });
                } catch (error) {
                    console.error('Error:', error);
                    customerList.innerHTML = '<p>Error fetching bookings</p>';
                }
            }
        });
    }

    // Sales Page: Fetch and Filter Sales from Backend
    const filterDate = document.getElementById('filterDate');
    const filterBranch = document.getElementById('filterBranch');
    const salesDetails = document.getElementById('salesDetails');
    const totalAmount = document.getElementById('totalAmount');

    if (filterDate && filterBranch && salesDetails && totalAmount) {
        const updateSales = async () => {
            const selectedDate = filterDate.value;
            const selectedBranch = filterBranch.value;

            const params = new URLSearchParams();
            if (selectedDate) params.append('date', selectedDate);
            if (selectedBranch) params.append('branch', selectedBranch);

            try {
                const response = await fetch(`http://localhost:5000/api/bookings/filter?${params.toString()}`);
                const filteredBookings = await response.json();

                salesDetails.innerHTML = filteredBookings.map(booking => `
                    <div class="sales-entry">
                        <p><strong>Booking ID:</strong> ${booking.uniqueId}</p>
                        <p><strong>Name:</strong> ${booking.customerName}</p>
                        <p><strong>Event Date:</strong> ${booking.eventDate}</p>
                        <p><strong>Event Time:</strong> ${booking.eventTime || 'Not specified'}</p>
                        <p><strong>Branch:</strong> ${booking.branch || 'Not specified'}</p>
                        <p><strong>Package:</strong> ${booking.selectedPackage}</p>
                        <p><strong>Amount:</strong> ${booking.amount}</p>
                        <hr class="separator">
                    </div>
                `).join('');

                const total = filteredBookings.reduce((sum, booking) => {
                    const amount = parseFloat(booking.amount.replace('₹', ''));
                    return sum + amount;
                }, 0);
                totalAmount.textContent = `Total Amount: ₹${total}`;
            } catch (error) {
                console.error('Error:', error);
                salesDetails.innerHTML = '<p>Error fetching sales data</p>';
            }
        };

        filterDate.addEventListener('change', updateSales);
        filterBranch.addEventListener('change', updateSales);
    }
});