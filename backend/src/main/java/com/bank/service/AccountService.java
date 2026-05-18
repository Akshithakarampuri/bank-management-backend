package com.bank.service;

import com.bank.model.Account;
import com.bank.model.Customer;
import com.bank.model.Transaction;
import com.bank.repository.AccountRepository;
import com.bank.repository.CustomerRepository;
import com.bank.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.Random;

@Service
public class AccountService {

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    public List<Account> getAllAccounts() {
        return accountRepository.findAll();
    }

    public Optional<Account> getAccountById(Long id) {
        return accountRepository.findById(id);
    }

    public List<Account> getAccountsByCustomerId(Long customerId) {
        return accountRepository.findByCustomerId(customerId);
    }

    public Account createAccount(Long customerId, Account account) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found with id: " + customerId));
        account.setCustomer(customer);
        account.setAccountNumber(generateAccountNumber());
        return accountRepository.save(account);
    }

    public Account updateAccount(Long id, Account accountDetails) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Account not found with id: " + id));
        account.setAccountType(accountDetails.getAccountType());
        account.setStatus(accountDetails.getStatus());
        return accountRepository.save(account);
    }

    public void deleteAccount(Long id) {
        if (!accountRepository.existsById(id)) {
            throw new RuntimeException("Account not found with id: " + id);
        }
        accountRepository.deleteById(id);
    }

    @Transactional
    public Transaction deposit(Long accountId, BigDecimal amount, String description) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Account not found"));
        if (account.getStatus() != Account.AccountStatus.ACTIVE) {
            throw new RuntimeException("Account is not active");
        }
        account.setBalance(account.getBalance().add(amount));
        accountRepository.save(account);

        Transaction tx = new Transaction();
        tx.setAccount(account);
        tx.setTransactionType(Transaction.TransactionType.DEPOSIT);
        tx.setAmount(amount);
        tx.setBalanceAfter(account.getBalance());
        tx.setDescription(description != null ? description : "Deposit");
        return transactionRepository.save(tx);
    }

    @Transactional
    public Transaction withdraw(Long accountId, BigDecimal amount, String description) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Account not found"));
        if (account.getStatus() != Account.AccountStatus.ACTIVE) {
            throw new RuntimeException("Account is not active");
        }
        if (account.getBalance().compareTo(amount) < 0) {
            throw new RuntimeException("Insufficient balance");
        }
        account.setBalance(account.getBalance().subtract(amount));
        accountRepository.save(account);

        Transaction tx = new Transaction();
        tx.setAccount(account);
        tx.setTransactionType(Transaction.TransactionType.WITHDRAWAL);
        tx.setAmount(amount);
        tx.setBalanceAfter(account.getBalance());
        tx.setDescription(description != null ? description : "Withdrawal");
        return transactionRepository.save(tx);
    }

    @Transactional
    public Transaction transfer(Long fromAccountId, Long toAccountId, BigDecimal amount, String description) {
        Account from = accountRepository.findById(fromAccountId)
                .orElseThrow(() -> new RuntimeException("Source account not found"));
        Account to = accountRepository.findById(toAccountId)
                .orElseThrow(() -> new RuntimeException("Destination account not found"));
        if (from.getBalance().compareTo(amount) < 0) {
            throw new RuntimeException("Insufficient balance");
        }
        from.setBalance(from.getBalance().subtract(amount));
        to.setBalance(to.getBalance().add(amount));
        accountRepository.save(from);
        accountRepository.save(to);

        Transaction tx = new Transaction();
        tx.setAccount(from);
        tx.setTransactionType(Transaction.TransactionType.TRANSFER);
        tx.setAmount(amount);
        tx.setBalanceAfter(from.getBalance());
        tx.setDescription("Transfer to " + to.getAccountNumber() + (description != null ? ": " + description : ""));
        return transactionRepository.save(tx);
    }

    public List<Transaction> getTransactionsByAccountId(Long accountId) {
        return transactionRepository.findByAccountIdOrderByCreatedAtDesc(accountId);
    }

    private String generateAccountNumber() {
        Random rnd = new Random();
        String num;
        do {
            num = String.format("%010d", (long)(rnd.nextDouble() * 9_000_000_000L) + 1_000_000_000L);
        } while (accountRepository.existsByAccountNumber(num));
        return num;
    }
}
