package de.finanzuhu.web;

import de.finanzuhu.data.LedgerRepository;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class PageController {
    private final LedgerRepository ledger;
    public PageController(LedgerRepository ledger) { this.ledger = ledger; }

    @GetMapping({"/", "/transactions"})
    public String page(jakarta.servlet.http.HttpServletRequest request, Model model) {
        boolean overview = request.getRequestURI().equals("/");
        model.addAttribute("account", ledger.account());
        model.addAttribute("screen", overview ? "overview" : "transactions");
        return overview ? "overview" : "transactions";
    }
}
