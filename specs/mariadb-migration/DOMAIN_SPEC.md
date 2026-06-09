# Domain Specification - MariaDB Migration

## Domain Mappings
Since GORM is used as the Object-Relational Mapper (ORM), the Go struct fields map to database columns using struct tags. To migrate to MariaDB, the database-specific tags in our domain types must be updated.

### Mappings changes:
1. **UUIDs**:
   - PostgreSQL tags: `gorm:"type:uuid;primary_key;default:uuid_generate_v4()"` and `gorm:"type:uuid"`
   - MariaDB tags: `gorm:"type:char(36);primary_key;default:(uuid())"` and `gorm:"type:char(36)"`
2. **JSONB**:
   - PostgreSQL tags: `gorm:"type:jsonb;not null"`
   - MariaDB tags: `gorm:"type:json;not null"`
3. **Timestamps**:
   - PostgreSQL tags: `gorm:"type:timestamp with time zone;default:CURRENT_TIMESTAMP"`
   - MariaDB tags: `gorm:"type:timestamp;default:CURRENT_TIMESTAMP"`

## Affected Files
The following files in `backend/internal/domain/` contain database-specific struct tags and must be modified:
- [company.go](file:///Users/gedalias.caldas/Documents/client-suport/backend/internal/domain/company.go)
- [user.go](file:///Users/gedalias.caldas/Documents/client-suport/backend/internal/domain/user.go)
- [client.go](file:///Users/gedalias.caldas/Documents/client-suport/backend/internal/domain/client.go)
- [process.go](file:///Users/gedalias.caldas/Documents/client-suport/backend/internal/domain/process.go)
- [establishment.go](file:///Users/gedalias.caldas/Documents/client-suport/backend/internal/domain/establishment.go)
- [annotation.go](file:///Users/gedalias.caldas/Documents/client-suport/backend/internal/domain/annotation.go)
- [document.go](file:///Users/gedalias.caldas/Documents/client-suport/backend/internal/domain/document.go)
