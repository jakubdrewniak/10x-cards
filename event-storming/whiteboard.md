```mermaid
flowchart LR
    %% Zwiększamy odstępy i czytelność
    classDef default font-size:14px;
    linkStyle default stroke-width:2px;

    subgraph Legenda
        DE0[Domain Event]
        CMD0[Command]
        RM0[(Read Model)]
        POL0>Policy]
        AGG0{Aggregate}
        HS0/!/
        ACT0((Actor))
        EX0{{External System}}

        style DE0 fill:#FF9900,color:black
        style CMD0 fill:#1E90FF,color:white
        style RM0 fill:#32CD32,color:black
        style POL0 fill:#9932CC,color:white
        style AGG0 fill:#FFFF00,color:black
        style HS0 fill:#FF0000,color:white
        style ACT0 fill:#FFFF00,color:black
        style EX0 fill:#A9A9A9,color:white
    end

    %% Aktorzy
    ACT1((Student))
    ACT2((System))

    subgraph Proces_Nauki
        direction LR
        subgraph Podstawowy_Przepływ
            direction LR
            CMD1[Rozpocznij naukę]
            CMD2[Oceń odpowiedź jako poprawną]
            CMD3[Oceń odpowiedź jako błędną]
            CMD6[Zakończ sesję nauki]
            
            DE1[Fiszka została<br/>pokazana]
            DE2[Odpowiedź została<br/>oceniona jako poprawna]
            DE3[Fiszka została przeniesiona<br/>do wyższej przegródki]
            DE4[Odpowiedź została<br/>oceniona jako błędna]
            DE5[Fiszka została przywrócona<br/>do pierwszej przegródki]
            DE11[Sesja nauki została<br/>zakończona]
            DE12[Postęp nauki został<br/>zapisany]
        end

        subgraph Ukończenie_Zestawu
            direction LR
            DE6[Wszystkie fiszki osiągnęły<br/>ostatnią przegródkę]
            DE7[Zestaw został<br/>ukończony]
        end

        subgraph Harmonogramowanie
            direction LR
            CMD4[Zaplanuj następną powtórkę]
            DE8[Termin powtórki<br/>został wyznaczony]
            DE9[Fiszka stała się<br/>dostępna do powtórki]
        end
    end

    subgraph Proces_Administracyjny
        direction LR
        CMD5[Przenieś fiszkę do<br/>wybranej przegródki]
        DE10[Fiszka została przeniesiona<br/>ręcznie]
    end

    %% Połączenia między elementami
    ACT1 -->|wykonuje| CMD1
    ACT1 -->|wykonuje| CMD2
    ACT1 -->|wykonuje| CMD3
    ACT1 -->|"zarządza ręcznie"| CMD5
    ACT1 -->|wykonuje| CMD6
    ACT2 -->|wykonuje| CMD4

    CMD1 -.-> DE1
    CMD2 -.-> DE2
    CMD3 -.-> DE4
    CMD4 -.-> DE8
    CMD5 -.-> DE10
    CMD6 -.-> DE11

    DE1 --> DE2
    DE2 --> DE3
    DE1 --> DE4
    DE4 --> DE5
    DE3 --> DE8
    DE5 --> DE8
    DE8 --> DE9
    DE9 --> DE1
    DE3 --> DE6
    DE6 --> DE7
    DE10 --> DE8
    DE11 --> DE12

    %% Style dla wszystkich elementów
    style DE1 fill:#FF9900,color:black
    style DE2 fill:#FF9900,color:black
    style DE3 fill:#FF9900,color:black
    style DE4 fill:#FF9900,color:black
    style DE5 fill:#FF9900,color:black
    style DE6 fill:#FF9900,color:black
    style DE7 fill:#FF9900,color:black
    style DE8 fill:#FF9900,color:black
    style DE9 fill:#FF9900,color:black
    style DE10 fill:#FF9900,color:black
    style DE11 fill:#FF9900,color:black
    style DE12 fill:#FF9900,color:black

    style CMD1 fill:#1E90FF,color:white
    style CMD2 fill:#1E90FF,color:white
    style CMD3 fill:#1E90FF,color:white
    style CMD4 fill:#1E90FF,color:white
    style CMD5 fill:#1E90FF,color:white
    style CMD6 fill:#1E90FF,color:white

    style ACT1 fill:#FFFF00,color:black
    style ACT2 fill:#FFFF00,color:black